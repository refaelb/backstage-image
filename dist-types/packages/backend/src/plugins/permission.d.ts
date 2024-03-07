import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { Entity } from '@backstage/catalog-model';
export default function createPlugin(env: PluginEnvironment): Promise<Router>;
export declare const isUserInGroupPartOfSystemRule: import("@backstage/plugin-permission-node").PermissionRule<Entity, import("@backstage/plugin-catalog-node").EntitiesSearchFilter, "catalog-entity", {
    memberof: string;
}>;
export declare const isInSystemRule: import("@backstage/plugin-permission-node").PermissionRule<Entity, import("@backstage/plugin-catalog-node").EntitiesSearchFilter, "catalog-entity", {
    systemRef: string;
}>;
