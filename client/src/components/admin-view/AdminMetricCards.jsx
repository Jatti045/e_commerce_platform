import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AdminMetricCards = ({ cardTitle, cardDescription, cardContent }) => {
  return (
    <Card className="w-full dark:bg-black dark:border-zinc-900 dark:hover:border-zinc-700 h-full border-2 flex flex-col justify-start items-start overflow-hidden shadow-md rounded-2xl hover:scale-105 duration-300">
      <CardHeader>
        <div className="flex gap-4">
          <CardTitle className="dark:text-white">{cardTitle}</CardTitle>
          <CardDescription className="text-2xl dark:text-white lg:text-2xl text-black font-medium">
            {cardDescription}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className=" flex justify-center items-center text-5xl">
        <p>{cardContent}</p>
      </CardContent>
    </Card>
  );
};

export default AdminMetricCards;
