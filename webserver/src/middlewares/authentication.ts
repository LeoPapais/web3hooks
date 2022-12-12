import { Request, Response, NextFunction } from "express"

export default (req: Request, res: Response, next: NextFunction) => {
  if (req.query.rpc_provider && req.query.provider_key) next()
  else res.status(401).send({ message: 'Missing provider_key and rpc_provider.'})
}