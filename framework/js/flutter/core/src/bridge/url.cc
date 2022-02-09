#include "bridge/url.h"

namespace voltron {

#define CHECK_LEN_END(POS, LEN) if (POS >= LEN) { error_code = 100; goto __PARSE_END; }
#define WALK_SP(POS, LEN, BUF) for (; POS < LEN && BUF[POS] == ' '; POS++)
#define WALK_UNTIL(POS, LEN, BUF, DELC) for (; POS < LEN && BUF[POS] != DELC; POS++)
#define WALK_UNTIL2(POS, LEN, BUF, DELI1, DELI2) \
   for (; POS < LEN && BUF[POS] != DELI1 && BUF[POS] != DELI2; POS++)
#define WALK_UNTIL3(POS, LEN, BUF, DELI1, DELI2, DELI3) \
   for (; POS < LEN && BUF[POS] != DELI1 && BUF[POS] != DELI2 && BUF[POS] != DELI3; POS++)
#define CHECK_REMAIN_END(POS, LEN, REQ_LEN) \
   if ( LEN - POS < REQ_LEN) { error_code=100; goto __PARSE_END; }
#define WALK_CHAR(POS, BUF, DELI) if (BUF[POS++] != DELI) goto __PARSE_END

int kv_callback_vec(void* list, std::string k, std::string v);

char ToChar(const char* hex) {
 unsigned char nible[2];
 unsigned char c, base;
 for (int i = 0; i < 2; i++) {
   c = hex[i];
   if (c >= '0' && c <= '9') {
     base = '0';
   } else if (c >= 'A' && c <= 'F') {
     base = 'A' - 10;
   } else if (c >= 'a' && c <= 'f') {
     base = 'a' - 10;
   } else {
     throw 200;
   }
   nible[i] = c - base;
 }
 return ((nible[0] << 4) | nible[1]);
}

void ToHex(char* desthex, char c) {
 static char hextable[16] = { '0', '1', '2', '3', '4', '5', '6', '7', '8',
                             '9', 'A', 'B', 'C', 'D', 'E', 'F' };
 desthex[0] = hextable[c >> 4];
 desthex[1] = hextable[c & 0x0f];
}

Url::Url(std::string url) : url_(std::move(url)) {
 ParseUrl();
}

std::string Url::UrlDecode() {
 int error_code = 0;
 size_t pos = 0, per = 0;
 size_t len = url_.size();
 const char* buf = url_.c_str();
 std::string decstr;
 error_code = 0;
 for (per = pos = 0;;) {
   WALK_UNTIL2(pos, len, buf, '%', '+');
   decstr.append(buf, per, pos - per);
   if (pos >= len)
     goto __PARSE_END;
   if (buf[pos] == '%') {
     CHECK_REMAIN_END(pos, len, 3);
     try {
       char c = ToChar(buf + pos + 1);
       decstr.push_back(c);
       pos += 3;
       per = pos;
     } catch (int err) {
       error_code = err;
       goto __PARSE_END;
     }
     if (pos >= len)
       goto __PARSE_END;
   } else if (buf[pos] == '+') {
     decstr.push_back(' ');
     pos++;
     per = pos;
   }
 }

__PARSE_END:
 if (error_code != 0) {
   return "";
 }

 return decstr;
}

std::string Url::UrlEncode() {
 const char *ptr = url_.c_str();
 std::string enc;
 char c;
 char phex[3] = {'%'};
 for (size_t i = 0; i < url_.size(); i++) {
   c = ptr[i];
   if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')
       || (c >= '0' && c <= '9') || c == '_' || c == '-' || c == '*'
       || c == '.') {
     enc.push_back(c);
   } else if (c == ' ') {
     enc.push_back('+');
   } else {
     ToHex(phex + 1, c);
     enc.append(phex, 0, 3);
   }
 }
 return enc;
}

int Url::ParsePath(std::vector<std::string>* folders, std::string pathstr) {
 int error_code = 0;
 int path_pos = 0;
 size_t pos = 0;
 size_t len = pathstr.size();
 const char* str = pathstr.c_str();
 std::string name;
 for (pos = 0;;) {
   WALK_CHAR(pos, str, '/');
   path_pos = pos;
   CHECK_LEN_END(pos, len);
   WALK_UNTIL(pos, len, str, '/');
   name = pathstr.substr(path_pos, pos - path_pos);
   folders->push_back(name);
 }
__PARSE_END: return folders->size();
}

void Url::ParseUrl() {
 int error_code = 0;
 const char *str = url_.c_str();

 size_t pos, len;
 int scheme_pos, host_pos, port_pos, path_pos, param_pos, tag_pos;
 pos = 0;
 len = url_.size();
 WALK_SP(pos, len, str);  // remove preceding spaces.
 if (str[pos] == '/') {
   goto __PARSE_HOST;
 }

 // start protocol scheme
 scheme_pos = pos;
 WALK_UNTIL(pos, len, str, ':');
 CHECK_LEN_END(pos, len);
 scheme_ = url_.substr(scheme_pos, pos - scheme_pos);
 CHECK_REMAIN_END(pos, len, 3);
 WALK_CHAR(pos, str, ':');
 WALK_CHAR(pos, str, '/');

// start host address
__PARSE_HOST:
 WALK_CHAR(pos, str, '/');
 host_pos = pos;
 WALK_UNTIL3(pos, len, str, ':', '/', '?');
 if (pos < len) {
   host_ = url_.substr(host_pos, pos - host_pos);
   if (str[pos] == ':')
     goto __PARSE_PORT;
   if (str[pos] == '/')
     goto __PARSE_PATH;
   if (str[pos] == '?')
     goto __PARSE_PARAM;
 } else {
   host_ = url_.substr(host_pos, pos - host_pos);
 }

__PARSE_PORT:
 WALK_CHAR(pos, str, ':');
 port_pos = pos;
 WALK_UNTIL2(pos, len, str, '/', '?');
 port_ = url_.substr(port_pos, pos - port_pos);
 CHECK_LEN_END(pos, len);
 if (str[pos] == '?')
   goto __PARSE_PARAM;
__PARSE_PATH: path_pos = pos;
 WALK_UNTIL(pos, len, str, '?');
 path_ = url_.substr(path_pos, pos - path_pos);
 CHECK_LEN_END(pos, len);
__PARSE_PARAM:
 WALK_CHAR(pos, str, '?');
 param_pos = pos;
 WALK_UNTIL(pos, len, str, '#');
 query_ = url_.substr(param_pos, pos - param_pos);
 ParseKeyValueList(&query_map_, query_, false);
 CHECK_LEN_END(pos, len);

 // start parsing fragment
 WALK_CHAR(pos, str, '#');
 tag_pos = pos;
 fragment_ = url_.substr(tag_pos, len - tag_pos);

__PARSE_END: return;
}

size_t Url::ParseKeyValueList(std::vector<KeyValPair > *kvvec,
                             const std::string& query_str,
                             bool strict) {
 return ParseKeyValue(query_str, kv_callback_vec, kvvec, strict);
}

size_t Url::ParseKeyValue(const std::string& query_str, kv_callback kvcb, void* obj, bool strict) {
 int error_code = 0;
 const char *str = query_str.c_str();
 size_t pos, len, item_len;
 pos = 0;
 len = query_str.size();

 std::string key, val;
 size_t key_pos;
 WALK_SP(pos, len, str);
 CHECK_LEN_END(pos, len);
 key_pos = pos;
 item_len = 0;
 for (;;) {
   WALK_UNTIL2(pos, len, str, '=', '&');
   if (pos >= len || str[pos] == '&') {
     // Be careful for boundary check error to be caused. !!!
     // *** Do not access str[] any more in this block. !!!

     val = query_str.substr(key_pos, pos-key_pos);

     if (strict) {
       if (!key.empty() && !val.empty()) {
         kvcb(obj, key, val);
         item_len++;
       }
     } else if (!(key.empty() && val.empty())) {
       kvcb(obj, key, val);
       item_len++;
     }

     key.clear();
     val.clear();
     if (pos >= len) goto __PARSE_END;
     pos++;
     key_pos = pos;
   } else if (str[pos] == '=') {
     key = query_str.substr(key_pos, pos-key_pos);
     pos++;
     key_pos = pos;
   }
 }
__PARSE_END:
 if (error_code != 0 )
   return -1;
 return item_len;
}

int kv_callback_vec(void* list, std::string k, std::string v) {
 auto *vec = (std::vector<KeyValPair>*)list;
 KeyValPair t = KeyValPair(k, v);
 vec->push_back(t);
 return vec->size();
}
}  // namespace crossing
