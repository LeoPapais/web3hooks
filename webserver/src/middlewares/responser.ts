import type { Request, Response } from 'express'

import { CustomErrors } from 'src/errors'

const responser = <T, R>(validator: (req: Request) => T, handler: (valReq: T) => R) => async (req: Request, res: Response) => {
  try {
    const validatedReq = validator(req)
    const response = await handler(validatedReq)
    res.send(response)
  } catch (e) {
    if (e instanceof CustomErrors) {
      return res.status(e.code).send({ message: e.msg })
    }
    console.error(e)
    return res.status(500).send({ message: 'UnexpectedError' })
  }
}

export default responser
