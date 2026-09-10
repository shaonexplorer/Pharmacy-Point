import { Request, Response } from 'express';
import * as s from './purchase-order.service';
export const list = async (req: Request, res: Response) => res.json(await s.listPOs(req.query.status as string));
export const get = async (req: Request, res: Response) => res.json(await s.getPO(req.params.id));
export const create = async (req: Request, res: Response) => res.status(201).json(await s.createPO(req.body));
export const approve = async (req: Request, res: Response) => res.json(await s.approvePO(req.params.id, req.body.approvedBy));
export const receive = async (req: Request, res: Response) => res.json(await s.receivePO(req.params.id));
