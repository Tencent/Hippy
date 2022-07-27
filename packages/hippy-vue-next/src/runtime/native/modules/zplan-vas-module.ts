export interface ShareArkToGroupParams {
  groupId: number;
  targetId: number;
  subText?: string;
  subSource?: number;
}

export interface ShareArkToGuildParams {
  guildId: number;
  channelId: string;
  targetId: number;
  guildIdType: number;
  subText?: string;
  subSource?: number;
}
export interface ZplanVasHippyAppModule {
  shareArkToGroup: (args: ShareArkToGroupParams) => unknown;
  shareArkToGuild: (args: ShareArkToGuildParams) => unknown;
}
