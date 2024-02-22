// ### deny access to delete all entities ###

// import { createRouter } from '@backstage/plugin-permission-backend';
// import {
//   AuthorizeResult,
//   PolicyDecision,
// } from '@backstage/plugin-permission-common';
// import { Router } from 'express';
// import { PluginEnvironment } from '../types';
// import {
//   PermissionPolicy,
//   PolicyQuery,
// } from '@backstage/plugin-permission-node';

// class TestPermissionPolicy implements PermissionPolicy {
//   async handle(request: PolicyQuery): Promise<PolicyDecision> {
//     if (request.permission.name === 'catalog.entity.delete') {
//       return {
//         result: AuthorizeResult.DENY,
//       };
//     }
//     return { result: AuthorizeResult.ALLOW };
//   }
// }

// export default async function createPlugin(
//   env: PluginEnvironment,
// ): Promise<Router> {
//   return await createRouter({
//     config: env.config,
//     logger: env.logger,
//     discovery: env.discovery,
//     policy: new TestPermissionPolicy(),
//     identity: env.identity,
//   });
// }














// tests 

// ### deny access to delete all entities if the user is not owner ###



import {
  catalogEntityDeletePermission,
} from '@backstage/plugin-catalog-common/alpha';


import { createRouter } from '@backstage/plugin-permission-backend';
// import {
//   AuthorizeResult,
//   PolicyDecision,
//   isPermission,
//   // isResourcePermission,
// } from '@backstage/plugin-permission-common';
import { Router } from 'express';
import { PluginEnvironment } from '../types';


import { PermissionPolicy, PolicyQuery, createConditionFactory } from '@backstage/plugin-permission-node';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import { AuthorizeResult, PolicyDecision,  isPermission } from '@backstage/plugin-permission-common';
import { catalogConditions, createCatalogConditionalDecision, createCatalogPermissionRule } from '@backstage/plugin-catalog-backend/alpha';



import type { Entity } from '@backstage/catalog-model';
// import { createCatalogPermissionRule } from '@backstage/plugin-catalog-backend/alpha';
// import { createConditionFactory } from '@backstage/plugin-permission-node';
import { z } from 'zod';



class TestPermissionPolicy implements PermissionPolicy {
  // async handle(request: PolicyQuery): Promise<PolicyDecision> {
  async handle(
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
    ): Promise<PolicyDecision> {
    console.log(request);
    if (isPermission(request.permission, catalogEntityDeletePermission)) {
    // if (isResourcePermission(request.permission, 'catalog-entity')) {
      return createCatalogConditionalDecision(
        request.permission,
        // catalogConditions.isEntityOwner({
        //   claims: user?.identity.ownershipEntityRefs ?? [],
        // }),
        {
        anyOf: [
          catalogConditions.isEntityOwner({
            claims: user?.identity.ownershipEntityRefs ?? [],
          }),
          isInSystem({ systemRef: 'interviewing' }),
        ],
        },
      );
    }
    return { result: AuthorizeResult.ALLOW };
  }
}

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
    policy: new TestPermissionPolicy(),
    identity: env.identity,
  });
}



export const isInSystemRule = createCatalogPermissionRule({
  name: 'IS_IN_SYSTEM',
  description: 'Checks if an entity is part of the system provided',
  resourceType: 'catalog-entity',
  paramsSchema: z.object({
    systemRef: z
      .string()
      .describe('SystemRef to check the resource is part of'),
  }),
  apply: (resource: Entity, { systemRef }) => {
    if (!resource.relations) {
      return false;
    }

    return resource.relations
      .filter(relation => relation.type === 'partOf')
      .some(relation => relation.targetRef === systemRef);
  },
  toQuery: ({ systemRef }) => ({
    key: 'relations.partOf',
    values: [systemRef],
  }),
});

const isInSystem = createConditionFactory(isInSystemRule);