import express, { Express } from "express"

export default function routeStatic(app: Express) {
  app.use(express.static('public/'))
}
