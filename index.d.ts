declare module "express-subdomain" {
  import { NextFunction, Request, Response } from "express";

  /**
   * Middleware function to match a subdomain and execute a callback function.
   * @param subdomain - The subdomain string to match.
   * @param fn - The callback function that handles requests.
   * @returns Middleware function.
   */
  export default function func(
    subdomain: string,
    fn: (req: Request, res: Response, next: NextFunction) => void
  ): (req: Request, res: Response, next: NextFunction) => void;
}
