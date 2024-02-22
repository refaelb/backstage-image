// // In your custom plugin's router, e.g., src/plugins/myplugin.ts
// import express from 'express';
// import { checkUserPermission } from './permission';

// const router = express.Router();

// router.get('/my-protected-resource', (req, res) => {
//     const userId = req.header('X-User-Id');
//     if (userId === undefined || !checkUserPermission(userId, 'admin')) {
//       return res.status(403).json({ error: 'Access denied' });
//     }
//   res.json({ data: 'This is protected data for admins only.' });
// });

// export { router };
