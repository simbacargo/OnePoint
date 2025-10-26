'use client'; // This directive makes it a Client Component

import React, { JSX, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // For programmatic navigation

interface AutocompleteResult {
  label: string;
  value: string;
  url: string;
}

function SearchAutocomplete(): JSX.Element {
  const [searchInput, setSearchInput] = useState('');
  const [autocompleteResults, setAutocompleteResults] = useState<AutocompleteResult[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const router = useRouter();

  const handleSearchInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputElement = event.target;
    setSearchInput(inputElement.value);
    const query = inputElement.value.trim();

    if (query) {
      try {
        const response = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`);
        console.clear();
    console.log(`etching products: ${response.status} ${response.statusText}`);
        // if (!response.ok) {
    // console.log(`Error fetching products: ${response.status} ${response.statusText}`);
          // throw new Error('Net/work response was not ok');
        // }
        const data: AutocompleteResult[] = await response.json();
        setAutocompleteResults(data);
        setShowAutocomplete(true);
      } catch (error: any) {
        console.error('Error fetching autocomplete results:', error);
        setAutocompleteResults([]);
        setShowAutocomplete(false);
      }
    } else {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
    }
  };

  const handleAutocompleteClick = (url: string) => {
    // In a Next.js app, instead of setting innerHTML, you'd navigate
    // to the URL, letting Next.js fetch and render the new page/content.
    if (url) {
      setShowAutocomplete(false); // Hide autocomplete results
      router.push(url); // Navigate to the selected URL
    }
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
    setShowAutocomplete(false); // Hide autocomplete results on search submit
  };

  return (
    <div className="search-bar">
      <form className="search-form d-flex align-items-center" onSubmit={handleSearchSubmit} autoComplete="off">
        <input
          type="text"
          id="search-input"
          name="q"
          placeholder="Search"
          title="Enter search keyword"
          value={searchInput}
          onChange={handleSearchInput}
        />
        <button type="submit" title="Search">
          <i className="bi bi-search"></i>
        </button>
      </form>
      {showAutocomplete && autocompleteResults.length > 0 && (
        <ul id="autocomplete-results" className="autocomplete-results">
          {autocompleteResults.map((result) => (
            <li className="autocomplete-result" key={Math.random()} onClick={() => handleAutocompleteClick(result.url)}>
              {/* Use Link for client-side transitions */}
              <Link href={JSON.stringify(result?.id)} className="autocomplete-link">
                <div>
                  <i className="bx bxl-product-hunt"></i> {result.partNumber} - {result.name}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchAutocomplete;