import { Response } from 'express';
import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT;

app.get('/', (res: Response) => {
  res.json({ message: 'Next Travel Backend' });
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
