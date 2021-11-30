String enumValueToString(Object o) => o.toString().split('.').last;

T? enumValueFromString<T>(String key, Iterable<T?> values) => values.firstWhere(
      (v) => v != null && key == enumValueToString(v),
      orElse: () => null,
    );
