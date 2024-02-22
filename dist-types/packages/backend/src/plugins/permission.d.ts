import { Router } from 'express';
import { PluginEnvironment } from '../types';
import type { Entity } from '@backstage/catalog-model';
export default function createPlugin(env: PluginEnvironment): Promise<Router>;
export declare const isInSystemRule: import("@backstage/plugin-permission-node").PermissionRule<Entity, import("@backstage/plugin-catalog-node").EntitiesSearchFilter, "catalog-entity", {
    systemRef: string;
}>;
