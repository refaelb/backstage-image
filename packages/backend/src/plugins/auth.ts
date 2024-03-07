// import {
//   createRouter,
//   providers,
//   defaultAuthProviderFactories,
// } from '@backstage/plugin-auth-backend';
// import { Router } from 'express';
// import { PluginEnvironment } from '../types';

// import {
//   stringifyEntityRef,
//   DEFAULT_NAMESPACE,
// } from '@backstage/catalog-model';

// export default async function createPlugin(
//   env: PluginEnvironment,
// ): Promise<Router> {
//   return await createRouter({
//     logger: env.logger,
//     config: env.config,
//     database: env.database,
//     discovery: env.discovery,
//     tokenManager: env.tokenManager,
//     providerFactories: {
//       ...defaultAuthProviderFactories,
//       github: providers.github.create({
//         signIn: {
//           // resolver(_, ctx) {
//           //   const userRef = 'user:default/guest'; // Must be a full entity reference
//           //   return ctx.issueToken({
//           //     claims: {
//           //       sub: userRef, // The user's own identity
//           //       ent: [userRef], // A list of identities that the user claims ownership through
//           //     },
//           //   });
//           // },
          
//           // resolver: providers.github.resolvers.usernameMatchingUserEntityName(),


//           // resolver: async ({ profile }, ctx) => {
//           //   if (!profile.email) {
//           //     throw new Error(
//           //       'Login failed, user profile does not contain an email',
//           //     );
//           //   }
//           //   // Split the email into the local part and the domain.
//           //   const [localPart, domain] = profile.email.split('@');

//           //   // Next we verify the email domain. It is recommended to include this
//           //   // kind of check if you don't look up the user in an external service.
//           //   if (domain !== 'acme.org') {
//           //     throw new Error(
//           //       `Login failed, this email ${profile.email} does not belong to the expected domain`,
//           //     );
//           //   }

//           //   // By using `stringifyEntityRef` we ensure that the reference is formatted correctly
//           //   const userEntity = stringifyEntityRef({
//           //     kind: 'User',
//           //     name: localPart,
//           //     namespace: DEFAULT_NAMESPACE,
//           //   });
//           //   return ctx.issueToken({
//           //     claims: {
//           //       sub: userEntity,
//           //       ent: [userEntity],
//           //     },
//           //   });
//           // },





//         },
//       }),
//     },
//   });
// }









//work#########

// import { createRouter, providers } from '@backstage/plugin-auth-backend';
// import { Router } from 'express';
// import { PluginEnvironment } from '../types';
// import {
//   stringifyEntityRef,
//   DEFAULT_NAMESPACE,
// } from '@backstage/catalog-model';

// export default async function createPlugin(
//   env: PluginEnvironment,
// ): Promise<Router> {
//   return await createRouter({
//     ...env,
//     providerFactories: {
//       github: providers.github.create({
//         signIn: {
//           resolver: async ({ profile }, ctx) => {
//             if (!profile.email) {
//               console.log(profile.displayName)
//               // throw new Error(
//               //   'Login failed, user profile does not contain an email',
//               // );
//             }
//             // Split the email into the local part and the domain.
//             const [localPart] = profile.displayName + "@bankleumi";
//             // const [localPart] = profile.email;

//             // Next we verify the email domain. It is recommended to include this
//             // kind of check if you don't look up the user in an external service.
//             // if (domain !== 'acme.org') {
//             //   throw new Error(
//             //     `Login failed, this email ${profile.email} does not belong to the expected domain`,
//             //   );
//             // }

//             // By using `stringifyEntityRef` we ensure that the reference is formatted correctly
//             const userEntity = stringifyEntityRef({
//               kind: 'User',
//               name: localPart,
//               namespace: "default",
//             });
//             return ctx.issueToken({
//               claims: {
//                 sub: userEntity,
//                 ent: [userEntity],
//               },
//             });
//           },
//         },
//       }),
//       microsoft: providers.microsoft.create({
//         signIn: {
//           resolver: async ({ profile }, ctx) => {
//               if (!profile.email) {
//                 throw new Error(
//                   'Login failed, user profile does not contain an email',
//                 );
//               }
//               // We again use the local part of the email as the user name.
//               const [localPart] = profile.email.split('@');

//               // By using `stringifyEntityRef` we ensure that the reference is formatted correctly
//               const userEntityRef = stringifyEntityRef({
//                 kind: 'User',
//                 name: localPart,
//                 namespace: DEFAULT_NAMESPACE,
//               });

//               return ctx.issueToken({
//                 claims: {
//                   sub: userEntityRef,
//                   ent: [userEntityRef],
//                 },
//               });
//             },
//         },
//       }),
//     },
//   });
// }



//tests##########
import {
  createRouter,
  providers,
  defaultAuthProviderFactories,
} from '@backstage/plugin-auth-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { DEFAULT_NAMESPACE, stringifyEntityRef, } from '@backstage/catalog-model';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
    database: env.database,
    discovery: env.discovery,
    tokenManager: env.tokenManager,
    providerFactories: {
      ...defaultAuthProviderFactories,
      microsoft: providers.microsoft.create({
        signIn: {
          resolver: async ({ profile }, ctx) => {
              if (!profile.email) {
                throw new Error(
                  'Login failed, user profile does not contain an email',
                );
              }
              // We again use the local part of the email as the user name.
              // const localPart = profile.email.split§;
              const [localPart] = profile.email.split('@');

              // const [localPart] = profile.email;
              // const [localPart] = profile.displayName;

              // By using `stringifyEntityRef` we ensure that the reference is formatted correctly
              const userEntityRef = stringifyEntityRef({
                kind: 'User',
                name: localPart,
                namespace: "default",
              });

              return ctx.issueToken({
                claims: {
                  sub: userEntityRef,
                  ent: [userEntityRef],
                },
              });
            },
        },
      }),

      github: providers.github.create({
        signIn: {
          resolver(_, ctx) {
            const userRef = 'user:default/guest'; // Must be a full entity reference
            return ctx.issueToken({
              claims: {
                sub: userRef, // The user's own identity
                ent: [userRef], // A list of identities that the user claims ownership through
              },
            });
          },
          // resolver: providers.github.resolvers.usernameMatchingUserEntityName(),
        },
      }),
    },
  });
}

