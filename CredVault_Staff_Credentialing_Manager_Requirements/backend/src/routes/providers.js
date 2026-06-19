import express from 'express';
import * as providerController from '../controllers/providerController.js';

const router = express.Router();

router.get('/meta', providerController.getProviderMeta);
router.get('/', providerController.getProviders);
router.post('/', providerController.createProvider);
router.get('/:id', providerController.getProviderById);
router.patch('/:id', providerController.updateProvider);
router.delete('/:id', providerController.deleteProvider);

export default router;
