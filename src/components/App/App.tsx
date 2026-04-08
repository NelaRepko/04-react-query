import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import MovieModal from "../MovieModal/MovieModal";
import { fetchMovies } from "../../services/movieService";
import type { Movie } from "../../types/movie";
import { Toaster, toast } from "react-hot-toast";
import ReactPaginateImport from "react-paginate";
import css from "./App.module.css";

// 🔥 ФІКС react-paginate
const ReactPaginate =
  (ReactPaginateImport as any).default || ReactPaginateImport;

export default function App() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // 🔹 пошук
  const handleSearch = (newQuery: string) => {
    if (!newQuery.trim()) {
      toast.error("Please enter your search query.");
      return;
    }

    setQuery(newQuery);
    setPage(1);
  };

  // 🔹 React Query
  const { data, isLoading, isError } = useQuery({
    queryKey: ["movies", query, page],
    queryFn: () => fetchMovies(query, page),
    enabled: !!query,
  });

  const movies = data?.results ?? [];
  const totalPages = data?.total_pages ?? 0;

  // 🔥 ДОДАМО DEBUG (потім видалиш)
  const handleSelectMovie = (movie: Movie) => {
    console.log("SELECT MOVIE:", movie.title);
    setSelectedMovie(movie);
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <SearchBar onSubmit={handleSearch} />

      {isLoading && <Loader />}
      {isError && <ErrorMessage />}

      {/* 🔥 ВАЖЛИВО: окремий wrapper */}
      {!isLoading && !isError && movies.length > 0 && (
        <div style={{ position: "relative", zIndex: 1 }}>
          <MovieGrid movies={movies} onSelect={handleSelectMovie} />
        </div>
      )}

      {/* 🔹 ПАГІНАЦІЯ */}
      {totalPages > 1 && (
        <ReactPaginate
          pageCount={totalPages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }: { selected: number }) =>
            setPage(selected + 1)
          }
          forcePage={page - 1}
          containerClassName={css.pagination}
          activeClassName={css.active}
          nextLabel="→"
          previousLabel="←"
        />
      )}

      {/* 🔥 МОДАЛКА */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </>
  );
}
