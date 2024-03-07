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



import {catalogEntityDeletePermission,} from '@backstage/plugin-catalog-common/alpha';
import { createRouter } from '@backstage/plugin-permission-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { PermissionPolicy, PolicyQuery, createConditionFactory } from '@backstage/plugin-permission-node';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import { AuthorizeResult, PolicyDecision,  isPermission } from '@backstage/plugin-permission-common';
import { catalogConditions, createCatalogConditionalDecision, createCatalogPermissionRule } from '@backstage/plugin-catalog-backend/alpha';
import { Entity, parseEntityRef, RELATION_MEMBER_OF } from '@backstage/catalog-model';
import { promise, z } from 'zod';
import axios from 'axios'
import { useApi, identityApiRef } from '@backstage/core-plugin-api'



const fetch = require('node-fetch');
async function getUserGroups(userName: string, token: string) {
  const url = `http://127.0.0.1:7007/api/catalog/entities/by-name/user/default/${userName}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    const { relations } = data;
    const targetRefs = relations.map(relation => relation.targetRef);
    // console.log(targetRefs);
    return targetRefs;
  } catch (error) {
    console.error('Error:', error);
    // throw error;
    return["group:default/default"];
  }
}
  

let groups: any = ["group:default/default"]; // הגדרת מערך הקבוצות בהיקף חיצוני
let intervalId: any = null; // משתנה לשמירת מזהה הטיימר

// פונקציה לעדכון קבוצות באופן מחזורי
async function updateGroups(userID: any, token: any) {
  try {
    const updatedGroups = await getUserGroups(userID, token);
    // console.log("User groups updated:", updatedGroups);
    groups = updatedGroups; // עדכון המערך groups
  } catch (error) {
    console.error('Error updating groups:', error);
  }
}

function startUpdatingGroups(userID: any, token: any) {
  if (intervalId === null) { // בדיקה אם הטיימר לא הופעל כבר
    updateGroups(userID, token); // עדכון ראשוני לפני התחלת הטיימר
    intervalId = setInterval(() => updateGroups(userID, token), 10000); // הפעלה מחזורית כל 30 שניות
    return groups;
  } else {
    return groups;
  }
}




class TestPermissionPolicy implements PermissionPolicy {
  async handle(
    request: PolicyQuery,
    user: BackstageIdentityResponse,
    ): Promise<PolicyDecision> {
      const userID = user.identity.userEntityRef .split("user:default/")[1];
      let group = startUpdatingGroups(userID,user.token)
      group = group ?? ["group:default/default"];
      if (group.includes("group:default/platform")) {
        return { result: AuthorizeResult.ALLOW };
      }
    if (isPermission(request.permission, catalogEntityDeletePermission)) {
      return createCatalogConditionalDecision(
        request.permission,
        {
        anyOf: [
          catalogConditions.isEntityOwner({
            claims: user?.identity.ownershipEntityRefs ?? [],
          }),
          isUserInGroupPartOfSystem({ memberof: group }),
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


export const isUserInGroupPartOfSystemRule = createCatalogPermissionRule({
  name: 'IS_USER_IN_GROUP_PART_OF_SYSTEM',
  description: 'Checks if any of the user\'s groups are part of the specified system',
  resourceType: 'catalog-entity',
  paramsSchema: z.object({
    memberof: z.any().describe('SystemRef to check the user\'s groups are part of'),
  }),
  
  apply: (resource: Entity, { memberof }) => {
    if (!resource.relations) {
      return false;
    }
    return resource.relations
    .filter(relation => relation.type === 'ownedBy')
    // .some(relation => relation.targetRef === memberof);
    .some(relation => memberof.includes(relation.targetRef));
  },
  
  toQuery: ({ memberof }) => ({
    key: 'relations.ownedBy',
    values: [memberof],
  }),
});


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
const isUserInGroupPartOfSystem = createConditionFactory(isUserInGroupPartOfSystemRule);
