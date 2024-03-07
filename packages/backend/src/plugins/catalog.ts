

// import { MicrosoftGraphOrgEntityProvider } from '@backstage/plugin-catalog-backend-module-msgraph';
// import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
// import {
//   defaultUserTransformer,
// } from '@backstage/plugin-catalog-backend-module-msgraph';
// import { GroupEntity, UserEntity } from '@backstage/catalog-model';
// import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
// import { ScaffolderEntitiesProcessor } from '@backstage/plugin-catalog-backend-module-scaffolder-entity-model';
// import { Router } from 'express';
// import { PluginEnvironment } from '../types';

// export default async function createPlugin(
//   env: PluginEnvironment,
// ): Promise<Router> {
//   const builder = await CatalogBuilder.create(env);

//   builder.addEntityProvider(
//     MicrosoftGraphOrgEntityProvider.fromConfig(env.config, {
//       groupTransformer: myGroupTransformer,
//       userTransformer: myUserTransformer,
//       organizationTransformer: myOrganizationTransformer,
//       logger: env.logger,
      
//       schedule: env.scheduler.createScheduledTaskRunner({
//         frequency: { hours: 12 },
//         timeout: { minutes: 15 },
//         initialDelay: { seconds: 15}
//       }),
//     }),
//   );
  
//   builder.addProcessor(new ScaffolderEntitiesProcessor());
//   const { processingEngine, router } = await builder.build();
//   await processingEngine.start();
//   return router;
// }


// export async function myGroupTransformer(
//   group: MicrosoftGraph.Group,
//   members: MicrosoftGraph.GroupMembers,
//   groupPhoto?: string,
  
//   ): Promise<GroupEntity | undefined> {
//   // console.log(groupmembers)
//   console.log("#####################################################################################################",members,group)
//   return {
//     apiVersion: 'backstage.io/v1alpha1',
//     kind: 'Group',
//     metadata: {
//       name: group.displayName!,
//       annotations: {},
//     },
//     spec: {
//       type: 'Microsoft Entra ID',
//       children: group.memberOf  || [],
//       members: members || [],
//       profile: {
//         displayName:  group.displayName,
//       },
      
//     },
//   };
// }

// export async function myUserTransformer(
//   graphUser: MicrosoftGraph.User,
//   userPhoto?: string,
// ): Promise<UserEntity | undefined> {
//   console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",graphUser)
//   return {
//   apiVersion: 'backstage.io/v1alpha1',
//     kind: 'User',
//     metadata: {
//       name: graphUser.displayName!,
//       annotations: {},
//     },
//     spec: {
//       memberOf: graphUser.memberOf||[],
//       profile: {
//         displayName:  graphUser.displayName,
//         email: graphUser.email,
//       },
      
//     },
//   };
// }

// export async function myOrganizationTransformer(
//   graphOrganization: MicrosoftGraph.Organization,
// ): Promise<GroupEntity | undefined> {
//   return undefined;
// }



























import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import { Config } from '@backstage/config';
import { ClientSecretCredential } from '@azure/identity';
import { CatalogBuilder, DefaultCatalogCollator } from '@backstage/plugin-catalog-backend';
import { Router } from 'express';
import { MicrosoftGraphClient, MicrosoftGraphOrgEntityProvider } from '@backstage/plugin-catalog-backend-module-msgraph';
import axios from 'axios';
import { PluginEnvironment } from '../types';
import { isInSystemRule ,isUserInGroupPartOfSystemRule } from './permission';
import * as dotenv from 'dotenv'
const { loadBackendConfig } = require('@backstage/config-loader');





async function createGraphClient(config: Config): Promise<MicrosoftGraphClient> {
  const tenantId = config.getString('catalog.providers.microsoftGraphOrg.default.tenantId');
  const clientId = config.getString('catalog.providers.microsoftGraphOrg.default.clientId');
  const clientSecret = config.getString('catalog.providers.microsoftGraphOrg.default.clientSecret');
  const authority = `https://login.microsoftonline.com/${tenantId}`;

  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
  return new MicrosoftGraphClient(credential, authority);
}

async function getAccessToken(clientId: string, clientSecret: string, tokenUrl: string): Promise<string> {
  try {
    const response = await axios.post(tokenUrl, {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://graph.microsoft.com/.default',
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Failed to obtain access token', error);
    throw new Error('Failed to obtain access token');
  }
}





async function fetchGroupMembers(groupId: string, env?: PluginEnvironment, config?: Config): Promise<string[]> {
  try {

    const tenantId = tests[0]
    const clientId = tests[1]
    const clientSecret = tests[2]
    const authority = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const accessToken = await getAccessToken(clientId, clientSecret, authority);

    const response = await axios.get(`https://graph.microsoft.com/v1.0/groups/${groupId}/members`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const memberIds = response.data.value.map((member: any) => member.userPrincipalName);
    return memberIds;
  } catch (error) {
    console.error('Failed to fetch group members from Microsoft Graph', error);
    throw new Error('Failed to fetch group members');
  }
}





export async function myGroupTransformer(
    group: MicrosoftGraph.Group,
    // members: MicrosoftGraph.GroupMembers,
    groupPhoto?: string,
    env?: PluginEnvironment,
    ): Promise<GroupEntity | undefined> {
  let members: string[] = [];
  members = await fetchGroupMembers(group.id,env);
  const localParts: string[] = members.filter((email): email is string => !!email).map(email => {
    return email.split("@")[0]; 
  });
  console.log(localParts);
  
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    metadata: {
      name: group.displayName,
      annotations: {},
    },
    spec: {
      type: 'Microsoft',
      children: [],
      members: localParts||[], // Use the fetched members
    },
  };
}

const tests: any = []
export default async function createPlugin(env: PluginEnvironment): Promise<Router> {
  const builder = await CatalogBuilder.create(env);
  builder.addPermissionRules(isInSystemRule,isUserInGroupPartOfSystemRule);

  const tenantId = env.config.get('catalog.providers.microsoftGraphOrg.default.tenantId');
  const clientId = env.config.get('catalog.providers.microsoftGraphOrg.default.clientId');
  const clientSecret = env.config.get('catalog.providers.microsoftGraphOrg.default.clientSecret');
  tests.push(tenantId,clientId,clientSecret)
  
  const graphClient = await createGraphClient(env.config); 
  
  builder.addEntityProvider(
    MicrosoftGraphOrgEntityProvider.fromConfig(env.config, {
      logger: env.logger,
      schedule: env.scheduler.createScheduledTaskRunner({
        frequency: { hours: 12 },
        timeout: { minutes: 15 },
        initialDelay: { seconds: 15 }
      }),
      groupTransformer: (group, photo) => myGroupTransformer(group, photo, graphClient), // Pass the graphClient to the transformer
      userTransformer: myUserTransformer,
      organizationTransformer: myOrganizationTransformer,
    }),
  );
  const { processingEngine, router } = await builder.build();
  await processingEngine.start();
  return router;
}

async function myUserTransformer(
  graphUser: MicrosoftGraph.User,
  userPhoto?: string,
): Promise<UserEntity | undefined> {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'User',
    metadata: {
      name: graphUser.displayName,
      annotations: {},
    },
    spec: {
      type: 'Microsoft Entra ID',
      memberOf: [],
    },
  };
}



export async function myOrganizationTransformer(
  graphOrganization: MicrosoftGraph.Organization,
): Promise<GroupEntity | undefined> {
  return undefined;
}

