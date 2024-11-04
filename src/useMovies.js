import { useState, useEffect } from "react";


export function useMovies(query, callBack) {
    const [movies, setMovies] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(function() {
        const controller = new AbortController();
    
        async function fetchMovies(){
    
          try{
            setError("");
    
            setIsLoading(true);
            const res =  await fetch(`http://www.omdbapi.com/?apikey=1df83281&s=${query}`, {signal: controller.signal});
      
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
        callBack?.();
    
        return function () {
          controller.abort();
        } 
      }, [query]);

      return {movies, isLoading, error}
}