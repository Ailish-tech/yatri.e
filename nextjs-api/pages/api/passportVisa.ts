import { NextApiRequest, NextApiResponse } from "next";

export default async function PassportVisa(req: NextApiRequest, res: NextApiResponse){
  const { origin, destination } = req.query;

  if(req.method === "GET"){
    if(!origin || !destination){
      return res.status(400).json({ error: "Missing query information for this request (Origin or Destination)" });
    }

    try {
      const response = await fetch(`https://rough-sun-2523.fly.dev/visa/${origin}/${destination}`);

      if(!response.ok){
        throw new Error("Failed to fetch Passport Visa information");
      }

      const data = await response.json();

      return res.status(200).json(data);
    } catch (error) {
      console.log("Error found: ", error);
      res.status(500).json({ error: "Something went wrong on fetch process of this Visa Information request" });
    }
  }else{
    res.status(405).end(`Method ${req.method} not allowed`);
  }
}