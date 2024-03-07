import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import { GroupEntity, UserEntity } from '@backstage/catalog-model';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
export default function createPlugin(env: PluginEnvironment): Promise<Router>;
export declare function myGroupTransformer(group: MicrosoftGraph.Group, groupPhoto?: string): Promise<GroupEntity | undefined>;
export declare function myUserTransformer(graphUser: MicrosoftGraph.User, userPhoto?: string): Promise<UserEntity | undefined>;
export declare function myOrganizationTransformer(graphOrganization: MicrosoftGraph.Organization): Promise<GroupEntity | undefined>;
