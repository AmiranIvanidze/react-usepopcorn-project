import React, { useState, useEffect } from 'react'


export default function useLocalStorageState( initialState, key ){
      const [value, setValue] = useState(function(){
        const stored = localStorage.getItem(key);
        return stored ?  JSON.parse(stored) : initialState;
    });

    useEffect(function(){
        localStorage.setItem(key, JSON.stringify(value));
    },[value, key]);


    return [value, setValue];
}   