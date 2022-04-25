import fs from 'fs';
import * as _ from 'lodash';
import path from 'path';
import { Protocol as P } from './protocol-schema';

let numIndents = 0;
let emitStr = '';

const emit = (str: string) => {
  emitStr += str;
};

const getIndent = () => '  '.repeat(numIndents); // 4 spaced indents

const emitIndent = () => {
  emitStr += getIndent();
};

const emitLine = (str?: string) => {
  if (str) {
    emitIndent();
    emit(`${str}\n`);
  } else {
    emit('\n');
  }
};

const emitOpenBlock = (str: string, openChar = ' {') => {
  emitLine(`${str}${openChar}`);
  numIndents += 1;
};

const emitCloseBlock = (closeChar = '}') => {
  numIndents -= 1;
  emitLine(closeChar);
};

const fixCamelCase = (name: string): string => {
  let prefix = '';
  let result = name;
  if (name[0] === '-') {
    prefix = 'Negative';
    result = name.substring(1);
  }
  const refined = result
    .split(/[-.\s]+/)
    .map(_.upperFirst)
    .join('');
  return prefix + refined.replace(/HTML|XML|WML|API/i, (match) => match.toUpperCase());
};

const emitEnum = (preFix: string, enumName: string, enumValues: string[]) => {
  emitOpenBlock(`${preFix} ${enumName}`);
  enumValues.forEach((value) => {
    emitLine(`${fixCamelCase(value)} = '${value}',`);
  });
  emitCloseBlock();
};

const emitEnums = (domains: P.Domain[]) => {
  // emitHeaderComments();
  domains.forEach((domain: P.Domain) => {
    if (domain.types)
      domain.types.forEach((type: P.DomainType) => {
        if (type.type === 'string' && type.enum) {
          // 枚举类型
          emitEnum('export enum', type.id, type.enum);
        }
      });
  });
};

const emitModule = (moduleName: string, domains: P.Domain[]) => {
  moduleName = _.upperFirst(moduleName);
  // emitHeaderComments()
  // emitPublicDocDeclaration()
  emitOpenBlock(`declare namespace ${moduleName}`);
  emitGlobalTypeDefs();
  domains.forEach(emitDomain);
  emitCloseBlock();
  emitLine();
  // emitLine(`export default ${moduleName};`)
};

const emitGlobalTypeDefs = () => {
  emitLine();
  emitLine(`type integer = number`);
};

const emitDomain = (domain: P.Domain) => {
  const domainName = _.upperFirst(domain.domain);
  emitLine();
  emitDescription(domain.description);
  emitOpenBlock(`namespace ${domainName}`);
  if (domain.types) domain.types.forEach(emitDomainType);
  if (domain.commands) domain.commands.forEach(emitCommand);
  if (domain.events) domain.events.forEach(emitEvent);
  emitCloseBlock();
};

const getCommentLines = (description: string) => {
  const lines = description.split(/\r?\n/g).map((line) => ` * ${line}`);
  return [`/**`, ...lines, ` */`];
};

const emitDescription = (description?: string) => {
  if (description) getCommentLines(description).map((l) => emitLine(l));
};

const isPropertyInlineEnum = (prop: P.ProtocolType): boolean => {
  if ('$ref' in prop) {
    return false;
  }
  return prop.type === 'string' && prop.enum !== null && prop.enum !== undefined;
};

const getPropertyDef = (interfaceName: string, prop: P.PropertyType): string => {
  // Quote key if it has a . in it.
  const propName = prop.name.includes('.') ? `'${prop.name}'` : prop.name;
  const type = getPropertyType(interfaceName, prop);
  return `${propName}${prop.optional ? '?' : ''}: ${type}`;
};

const getPropertyType = (interfaceName: string, prop: P.ProtocolType): string => {
  if ('$ref' in prop) return prop.$ref;
  if (prop.type === 'array') return `${getPropertyType(interfaceName, prop.items)}[]`;
  if (prop.type === 'object')
    if (!prop.properties) {
      // TODO: actually 'any'? or can use generic '[key: string]: string'?
      return `any`;
    } else {
      // hack: access indent, \n directly
      let objStr = '{\n';
      numIndents += 1;
      objStr += prop.properties.map((p) => `${getIndent()}${getPropertyDef(interfaceName, p)};\n`).join('');
      numIndents -= 1;
      objStr += `${getIndent()}}`;
      return objStr;
    }
  if (prop.type === 'string' && prop.enum) return `(${prop.enum.map((v: string) => `'${v}'`).join(' | ')})`;
  return prop.type;
};

const emitProperty = (interfaceName: string, prop: P.PropertyType) => {
  let { description } = prop;
  if (isPropertyInlineEnum(prop)) {
    const enumName = interfaceName + _.upperFirst(prop.name);
    description = `${description || ''} (${enumName} enum)`;
  }

  emitDescription(description);
  emitLine(`${getPropertyDef(interfaceName, prop)};`);
};

const emitInlineEnumForDomainType = (type: P.DomainType) => {
  if (type.type === 'object') {
    emitInlineEnums(type.id, type.properties);
  }
};

const emitInlineEnumsForCommands = (command: P.Command) => {
  emitInlineEnums(toCmdRequestName(command.name), command.parameters);
  emitInlineEnums(toCmdResponseName(command.name), command.returns);
};

const emitInlineEnumsForEvents = (event: P.Event) => {
  emitInlineEnums(toEventPayloadName(event.name), event.parameters);
};

const emitInlineEnums = (prefix: string, propertyTypes?: P.PropertyType[]) => {
  if (!propertyTypes) {
    return;
  }
  for (const type of propertyTypes) {
    if (isPropertyInlineEnum(type)) {
      emitLine();
      const enumName = prefix + _.upperFirst(type.name);
      emitEnum('enum', enumName, (type as P.StringType).enum || []);
    }
  }
};

const emitInterface = (interfaceName: string, props?: P.PropertyType[]) => {
  emitOpenBlock(`interface ${interfaceName}`);
  props ? props.forEach((prop) => emitProperty(interfaceName, prop)) : emitLine('[key: string]: string;');
  emitCloseBlock();
};

const emitDomainType = (type: P.DomainType) => {
  emitInlineEnumForDomainType(type);
  emitLine();
  emitDescription(type.description);

  if (type.type === 'object') {
    emitInterface(type.id, type.properties);
  } else if (type.type === 'string' && type.enum) {
    // 枚举类型
    emitEnum('enum', type.id, type.enum);
  } else {
    emitLine(`type ${type.id} = ${getPropertyType(type.id, type)};`);
  }
};

const toCmdRequestName = (commandName: string) => `${_.upperFirst(commandName)}Request`;

const toCmdResponseName = (commandName: string) => `${_.upperFirst(commandName)}Response`;

const emitCommand = (command: P.Command) => {
  emitInlineEnumsForCommands(command);
  // TODO(bckenny): should description be emitted for params and return types?
  if (command.parameters) {
    emitLine();
    emitInterface(toCmdRequestName(command.name), command.parameters);
  }

  if (command.returns) {
    emitLine();
    emitInterface(toCmdResponseName(command.name), command.returns);
  }
};

const toEventPayloadName = (eventName: string) => `${_.upperFirst(eventName)}Event`;

const emitEvent = (event: P.Event) => {
  if (!event.parameters) {
    return;
  }

  emitInlineEnumsForEvents(event);
  emitLine();
  emitDescription(event.description);
  emitInterface(toEventPayloadName(event.name), event.parameters);
};

const getEventMapping = (event: P.Event, domainName: string, modulePrefix: string): P.RefType & P.PropertyBaseType => {
  // Use TS3.0+ tuples
  const payloadType = event.parameters ? `[${modulePrefix}.${domainName}.${toEventPayloadName(event.name)}]` : '[]';

  return {
    // domain-prefixed name since it will be used outside of the module.
    name: `${domainName}.${event.name}`,
    description: event.description,
    $ref: payloadType,
  };
};

const isWeakInterface = (params: P.PropertyType[]): boolean => params.every((p) => !!p.optional);

const getCommandMapping = (
  command: P.Command,
  domainName: string,
  modulePrefix: string,
): P.ObjectType & P.PropertyBaseType => {
  const prefix = `${modulePrefix}.${domainName}.`;
  // Use TS3.0+ tuples for paramsType
  let requestType = '[]';
  if (command.parameters) {
    const optional = isWeakInterface(command.parameters) ? '?' : '';
    requestType = `[${prefix}${toCmdRequestName(command.name)}${optional}]`;
  }
  const responseType = command.returns ? prefix + toCmdResponseName(command.name) : 'void';

  return {
    type: 'object',
    name: `${domainName}.${command.name}`,
    description: command.description,
    properties: [
      {
        name: 'paramsType',
        $ref: requestType,
      },
      {
        name: 'returnType',
        $ref: responseType,
      },
    ],
  };
};

const flatten = <T>(arr: T[][]) => ([] as T[]).concat(...arr);

const emitMapping = (protocolModuleName: string, domains: P.Domain[]) => {
  const moduleName = _.upperFirst(`${protocolModuleName}Mapping`);
  // emitHeaderComments()
  // emitLine(`import ${_.upperFirst(protocolModuleName)} from './${fileName}'`)
  emitLine();
  emitDescription('Mappings from protocol event and command names to the types required for them.');
  emitOpenBlock(`declare namespace ${moduleName}`);

  const protocolModulePrefix = _.upperFirst(protocolModuleName);
  const eventDefs = flatten(
    domains.map((d) => {
      const domainName = _.upperFirst(d.domain);
      return (d.events || []).map((e) => getEventMapping(e, domainName, protocolModulePrefix));
    }),
  );
  emitInterface('Events', eventDefs);

  emitLine();

  const commandDefs = flatten(
    domains.map((d) => {
      const domainName = _.upperFirst(d.domain);
      return (d.commands || []).map((c) => getCommandMapping(c, domainName, protocolModulePrefix));
    }),
  );
  emitInterface('Commands', commandDefs);

  emitCloseBlock();
  emitLine();
  // emitLine(`export default ${moduleName};`)
};

const emitEnumsMapping = (prefix, domains: P.Domain[]) => {
  const eventDefs = flatten(
    domains.map((d) => {
      const domainName = _.upperFirst(d.domain);
      return (d.events || []).map((e) => getEventMapping(e, domainName, ''));
    }),
  );
  emitEnumInline(`${prefix}Event`, eventDefs);

  const commandDefs = flatten(
    domains.map((d) => {
      const domainName = _.upperFirst(d.domain);
      return (d.commands || []).map((c) => getCommandMapping(c, domainName, ''));
    }),
  );
  emitEnumInline(`${prefix}Command`, commandDefs);
};

const emitEnumInline = (
  prefix: string,
  defs: ((P.RefType & P.PropertyBaseType) | (P.ObjectType & P.PropertyBaseType))[],
) => {
  if (defs.length) {
    emitOpenBlock(`export enum ${prefix}`);
    defs.forEach((item) => {
      const name = _.upperFirst(item.name);
      emitLine(`${fixCamelCase(name)} = '${name}',`);
    });
    emitCloseBlock();
  }
};

const emitApiCommand = (command: P.Command, domainName: string, modulePrefix: string) => {
  const prefix = `${modulePrefix}.${domainName}.`;
  emitDescription(command.description);
  const params = command.parameters ? `params: ${prefix}${toCmdRequestName(command.name)}` : '';
  const response = command.returns ? `${prefix}${toCmdResponseName(command.name)}` : 'void';
  emitLine(`${command.name}(${params}): Promise<${response}>;`);
  emitLine();
};

const emitApiEvent = (event: P.Event, domainName: string, modulePrefix: string) => {
  const prefix = `${modulePrefix}.${domainName}.`;
  emitDescription(event.description);
  const params = event.parameters ? `params: ${prefix}${toEventPayloadName(event.name)}` : '';
  emitLine(`on(event: '${event.name}', listener: (${params}) => void): void;`);
  emitLine();
};

const emitDomainApi = (domain: P.Domain, modulePrefix: string) => {
  emitLine();
  const domainName = _.upperFirst(domain.domain);
  emitOpenBlock(`interface ${domainName}Api`);
  if (domain.commands) domain.commands.forEach((c) => emitApiCommand(c, domainName, modulePrefix));
  if (domain.events) domain.events.forEach((e) => emitApiEvent(e, domainName, modulePrefix));
  emitCloseBlock();
};

const emitApi = (protocolModuleName: string, domains: P.Domain[]) => {
  const moduleName = _.upperFirst(`${protocolModuleName}ProxyApi`);
  // emitHeaderComments()
  // emitLine(`import ${_.upperFirst(protocolModuleName)} from './${fileName}'`)
  emitLine();
  emitDescription('API generated from Protocol commands and events.');
  emitOpenBlock(`declare namespace ${moduleName}`);

  emitLine();
  emitOpenBlock(`interface ProtocolApi`);
  domains.forEach((d) => {
    emitLine(`${d.domain}: ${d.domain}Api;`);
    emitLine();
  });
  emitCloseBlock();
  emitLine();

  const protocolModulePrefix = _.upperFirst(protocolModuleName);
  domains.forEach((d) => emitDomainApi(d, protocolModulePrefix));
  emitCloseBlock();

  emitLine();
  // emitLine(`export default ${moduleName};`)
};

const flushEmitToFile = (path: string) => {
  console.log(`Writing to ${path}`);
  fs.writeFileSync(path, emitStr, { encoding: 'utf-8' });

  numIndents = 0;
  emitStr = '';
};

export const generateDts = async ({ inputFileNames, outputTypeFileName, outputEnumPrefix }) => {
  const destProtocolFilePath = path.join(__dirname, `../@types/${outputTypeFileName}.d.ts`);
  const destMappingFilePath = path.join(__dirname, `../@types/${outputTypeFileName}-mapping.d.ts`);
  const destApiFilePath = path.join(__dirname, `../@types/${outputTypeFileName}-proxy-api.d.ts`);
  const enumFilePath = path.join(__dirname, `../types/enum-${outputEnumPrefix}.ts`);
  const enumMappingFilePath = path.join(__dirname, `../types/enum-${outputEnumPrefix}-mapping.ts`);

  const domains = (
    await Promise.all(
      inputFileNames.map((inputFileName) => {
        const fpath = path.join(__dirname, '../json', inputFileName);
        return fs.promises.readFile(fpath, 'utf-8').then((res) => JSON.parse(res).domains);
      }),
    )
  ).flat() as P.Domain[];

  outputTypeFileName = _.camelCase(outputTypeFileName);
  outputTypeFileName = fixIOS(outputTypeFileName);
  emitModule(outputTypeFileName, domains);
  flushEmitToFile(destProtocolFilePath);

  emitMapping(outputTypeFileName, domains);
  flushEmitToFile(destMappingFilePath);

  emitApi(outputTypeFileName, domains);
  flushEmitToFile(destApiFilePath);

  emitEnums(domains);
  flushEmitToFile(enumFilePath);

  const enumPrefix = _.upperFirst(_.camelCase(outputEnumPrefix));
  emitEnumsMapping(fixIOS(enumPrefix), domains);
  flushEmitToFile(enumMappingFilePath);
};

function fixIOS(name: string) {
  return name.replace(/IOS/i, (match) => match.toUpperCase());
}
