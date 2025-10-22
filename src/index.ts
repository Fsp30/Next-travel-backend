import express, { Request, Response } from 'express';

import dotenv from 'dotenv';

dotenv.config();
const app = express();

const port = process.env.PORT;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Next Travel Backend',
  });
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
