import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];
const KEY = '1df83281';
const query = 'rocky';
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [movies, setMovies] = useState([]);
  // const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState();

  const [watched, setWatched] = useState(function(){
    const stored = localStorage.getItem('watched');
    return JSON.parse(stored);
  });

  const [selectedId, setSelectedId] = useState();


  function handleSelectedMovie(id){
    setSelectedId(selectedId =>  id == selectedId ? null : id );
  }

  function handleCloseMovie(){
    setSelectedId();
  }

  function handleAddWatched(movie){
    setWatched(watched => [...watched, movie]);
  }

  function handleDeleteWatched(id){
    setWatched(watched.filter(movie => movie.imdbID != id))
  }

  useEffect(function(){
    localStorage.setItem('watched', JSON.stringify(watched));
  },[watched]);
 
  useEffect(function() {
    const controller = new AbortController();

    async function fetchMovies(){

      try{
        setError("");

        setIsLoading(true);
        const res =  await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, {signal: controller.signal});
  
        if(!res.ok){
          throw new Error("SOmething went wrong with fetching movies")
        }
        const data = await res.json();

        if(data.Response == 'False'){
          throw new Error("Movie Not Found")

        }

        setIsLoading(false)
        setMovies(data.Search)
        setError("");
      }catch (err){
        if(err.name  !== "AbortError"){
          throw new Error("Movie Not Found")
        }
        setError(err.message);
      } finally {

        setIsLoading(false)
      }

      if(query?.length < 3) {
        setMovies([]);
        setError('');
        return;
      }


     


    }
    fetchMovies()
    handleCloseMovie( )

    return function () {
      controller.abort();
    } 
  }, [query]);



  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery}/>
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {isLoading && <Loader/>}
          {!isLoading && !error && <MovieList onSelectMovie={handleSelectedMovie} movies={movies} />}
          {error && <ErrorMessage message={error}/>}
        </Box>

        <Box>
         { selectedId ?
          <MovieDetails watched={watched} selectedId = {selectedId} onCloseMovies= {handleCloseMovie}  onAddWatched={handleAddWatched}/> :  
          <> 
            <WatchedSummary watched={watched} />
            <WatchedMoviesList watched={watched} onDeleteWatched={handleDeleteWatched} />
          </>
         
        
        }
        </Box>
      </Main>
    </>
  );
}

function Loader(){
  return (
    <p className="loader">
      Loading...
    </p>

  )
}

function ErrorMessage({message}){
  return (
    <p className="error">{ message }</p>
  )
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({query, setQuery}) {
  const inputElement = useRef(null);
  useEffect(function(){
    function callBack(e){
      if(document.activeElement == inputElement.current) return;

      if(e.code == "Enter"){
        inputElement.current.focus();
        setQuery("");
      }
    }

    document.addEventListener('keydown', callBack);

    return () => {
      document.addEventListener('keydown', callBack);

    }
  }, [setQuery]);
    return (
    <input
      ref={inputElement}
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

/*
function WatchedBox() {
  const [watched, setWatched] = useState(tempWatchedData);
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>

      {isOpen2 && (
        <>
          <WatchedSummary watched={watched} />
          <WatchedMoviesList watched={watched} />
        </>
      )}
    </div>
  );
}
*/

function MovieList({ onSelectMovie, movies }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie onSelectMovie={onSelectMovie} movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating)).toFixed(2);
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function MovieDetails({ selectedId, onCloseMovies, onAddWatched, watched }){
    const [movie, setMovie] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [ userRating, setUserRating ] = useState('');

    const countRef = useRef(0);

    useEffect(function(){
      if(userRating)  countRef.current = countRef.current + 1;

    }, [userRating]);

    const isWatched = watched.map( movie =>  movie.imdbID).includes(selectedId);
    const watchedUserRating = watched.find(movie => movie.imdbID == selectedId)?.userRating;

    const {
      Title: title,
      Year: year,
      Poster: poster,
      Runtime: runtime,
      Plot : plot,
      Released: released,
      Actors: actors,
      Director: director,
      Genre: genre,
      imdbRating : imdbRating,
      
    } = movie;

  useEffect(function(){
    async function getMovieDetails(){
      setIsLoading(true);
      const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }
    getMovieDetails();
  }, [selectedId]);

  function handleAdd(){
    const newWatchedMovie = {
      imdbID: selectedId,
      selectedId, 
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating,
    }

    onAddWatched(newWatchedMovie);
    onCloseMovies();
  }
  useEffect(function(){

    function callback(e){
        if(e.code == 'Escape'){
          onCloseMovies()
        }
    }
    document.addEventListener('keydown', callback);

    return function(){
      document.removeEventListener('keydown', callback);
    }
  }, [onCloseMovies]);

  useEffect(function(){
    if(!title){
      return 
    }
    document.title = `Movie | ${title}`;

    return function(){
      document.title = "usePopcorn";
    }

  }, [title]);

  return (
    <div className="details">
      { 
      isLoading ?
        <Loader/>:
        (
          <>
           <header>
              <button className="btn-back" onClick={onCloseMovies}>
                &larr;
              </button>
              <img src={poster} alt={`poster of ${movie}`}/>
              <div className="details-overview">
                <h2>{ title }</h2>
                <p>{ released } &bull; { runtime }</p>
                <p>{ genre }</p>
                <p><span>⭐️</span>{ imdbRating } IMDB Rating</p>

              </div>
            </header>

            <section>
              <div className="rating">

                {
                  !isWatched ? 
                  <>
                    <StarRating maxRating={10} size={24} onSetRating={setUserRating}/> 
                    {userRating > 0 && <button className="btn-add" onClick={handleAdd}>+ Add to the list</button>}
                  </>
               
                  : <p>You rated with movie {watchedUserRating} ⭐ </p>
              }
              </div>
              <p><em>{ plot }</em></p>
              <p>Starring { actors }</p>
              <p>Directed By { director }</p>
            </section>
          </>
        )
      }
     </div>
  )
}

function WatchedMoviesList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatched = {onDeleteWatched} />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}>❌</button>
      </div>
    </li>
  );
}