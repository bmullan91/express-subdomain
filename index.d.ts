import type { Request, Response } from 'express';

/**
 * @description The subdomain function.
 * @param subdomain The subdomain to listen on.
 * @param fn The listener function, takes a response and request.
 * @returns A function call to the value passed as FN, or void (the next function).
 */
declare function subdomain(
    subdomain: string,
    fn: (req: Request, res: Response) => void | any
): (req: Request, res: Response, next: () => void) => void | typeof fn;

export = subdomain;