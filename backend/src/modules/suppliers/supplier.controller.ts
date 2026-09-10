import { Request, Response } from 'express';
import * as service from './supplier.service';
export const list = async (req: Request, res: Response) => res.json(await service.listSuppliers(req.query.q as string));
export const get = async (req: Request, res: Response) => res.json(await service.getSupplier(req.params.id));
export const create = async (req: Request, res: Response) => res.status(201).json(await service.createSupplier(req.body));
export const update = async (req: Request, res: Response) => res.json(await service.updateSupplier(req.params.id, req.body));
export const remove = async (req: Request, res: Response) => { await service.deleteSupplier(req.params.id); res.status(204).send(); };
