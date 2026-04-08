// src/components/App/App.tsx
import { useState, useEffect } from "react";
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

// ФІКС для ReactPaginate
const ReactPaginate =
  (ReactPaginateImport as any).default || ReactPaginateImport;

export default function App() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [previousData, setPreviousData] = useState<{ results: Movie[]; total_pages: number } | null>(null);

  // пошук
  const handleSearch = (newQuery: string) => {
    if (!newQuery.trim()) {
      toast.error("Please enter your search query.");
      return;
    }
    setQuery(newQuery);
    setPage(1);
  };

  // useQuery з placeholderData
  const { data, isLoading, isError, isFetching, isSuccess } = useQuery({
    queryKey: ["movies", query, page],
    queryFn: () => fetchMovies(query, page),
    enabled: !!query,
    placeholderData: previousData ?? { results: [], total_pages: 0 }, // плавний UI
    // select зберігає попередні дані для імітації keepPreviousData
    select: (res) => {
      if (res.results.length === 0) return previousData ?? res;
      setPreviousData(res); // зберігаємо останні отримані дані
      return res;
    },
  });

  const movies = data?.results ?? [];
  const totalPages = data?.total_pages ?? 0;

  // toast, якщо запит успішний, але нічого не знайдено
  useEffect(() => {
    if (isSuccess && movies.length === 0 && query) {
      toast.error("No movies found for your request.");
    }
  }, [isSuccess, movies, query]);

  // обрання фільму
  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <SearchBar onSubmit={handleSearch} />

      {(isLoading || isFetching) && <Loader />}
      {isError && <ErrorMessage />}

      {!isLoading && !isError && movies.length > 0 && (
        <div style={{ position: "relative", zIndex: 1 }}>
          <MovieGrid movies={movies} onSelect={handleSelectMovie} />
        </div>
      )}

      {/* Пагінація */}
      {totalPages > 1 && (
        <ReactPaginate
          pageCount={totalPages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => setPage(selected + 1)}
          forcePage={page - 1}
          containerClassName={css.pagination}
          activeClassName={css.active}
          nextLabel="→"
          previousLabel="←"
        />
      )}

      {/* Модалка */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </>
  );
}
