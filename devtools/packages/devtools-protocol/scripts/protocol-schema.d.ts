/**  Definition for protocol.json types */
export interface IProtocol {
  version: Protocol.Version;
  domains: Protocol.Domain[];
}

export namespace Protocol {
  export interface Version {
    major: string;
    minor: string;
  }

  export interface Domain {
    /** Name of domain */
    domain: string;
    /** Description of the domain */
    description?: string;
    /** Dependencies on other domains */
    dependencies?: string[];
    /** Types used by the domain. */
    types?: DomainType[];
    /** Commands accepted by the domain */
    commands?: Command[];
    /** Events fired by domain */
    events?: Event[];
  }

  export interface Command extends Event {
    returns?: PropertyType[];
    async?: boolean;
    redirect?: string;
  }

  export interface Event {
    name: string;
    parameters?: PropertyType[];
    /** Description of the event */
    description?: string;
  }

  export interface ArrayType {
    type: 'array';
    /** Maps to a typed array e.g string[] */
    items: RefType | PrimitiveType | StringType | AnyType | ObjectType;
    /** Cardinality of length of array type */
    minItems?: number;
    maxItems?: number;
  }

  export interface ObjectType {
    type: 'object';
    /** Properties of the type. Maps to a typed object */
    properties?: PropertyType[];
  }

  export interface StringType {
    type: 'string';
    /** Possible values of a string. */
    enum?: string[];
  }

  export interface PrimitiveType {
    type: 'number' | 'integer' | 'boolean';
  }

  export interface AnyType {
    type: 'any';
  }

  export interface RefType {
    /** Reference to a domain defined type */
    $ref: string;
  }

  export interface PropertyBaseType {
    /** Name of param */
    name: string;
    /** Is the property optional ? */
    optional?: boolean;
    /** Description of the type */
    description?: string;
  }

  type DomainType = {
    /** Name of property */
    id: string;
    /** Description of the type */
    description?: string;
  } & (StringType | ObjectType | ArrayType | PrimitiveType);

  type ProtocolType = StringType | ObjectType | ArrayType | PrimitiveType | RefType | AnyType;

  type PropertyType = PropertyBaseType & ProtocolType;
}
