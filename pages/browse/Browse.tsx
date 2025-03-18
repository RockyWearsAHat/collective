import { FC, useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { ActiveContext } from "../contextProvider";
import { Helmet } from "react-helmet-async";
import { ImageScroller } from "../../components/imageScroller/imageScroller";

export const Browse: FC = () => {
  const { sort } = useParams();
  const { setActive } = useContext(ActiveContext);

  // Compute the initial search query based on the sort parameter
  const initialSearchQuery = () => {
    switch (sort) {
      case "popular":
        return { timesAddedToCart: -1 };
      case "money":
        return { price: -1 };
      case "recent":
        return { dateAdded: -1 };
      default:
        return {};
    }
  };

  // Initialize state with the computed value
  const [searchQuery, setSearchQuery] = useState<any>(initialSearchQuery());

  useEffect(() => {
    setActive("browse");
  }, [window.location.href]);

  // Update the search query if the sort parameter changes
  useEffect(() => {
    setSearchQuery(initialSearchQuery());
  }, [sort]);

  return (
    <>
      <Helmet>
        <title>
          {sort ? `Artist Collective | ${sort.charAt(0).toUpperCase() + sort.slice(1)}` : `Artist Collective | Browse`}
        </title>
      </Helmet>
      <div className="absolute left-0 top-0 z-10 h-[100vh] w-[100vw] pt-10">
        <ImageScroller chunkSize={10} searchQuery={searchQuery} horizontal={false} />
      </div>
    </>
  );
};
