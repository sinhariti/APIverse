import Graph from './graph';
import { ApiCard } from './api-card';
import { useMemo } from 'react';

function Content({
  hasSearched,
  searchResults,
  setSearchLoading,
  setSearchResults,
  setHasSearched
}) {

    const memoizedGraph = useMemo(() => (
    <Graph
          setSearchLoading={setSearchLoading}
          setSearchResults={setSearchResults}
          setHasSearched={setHasSearched}
        />
  ), []);

  if (!hasSearched) {
    return (
      <section className="container w-4/5 mx-auto mt-16 flex justify-center">
        {memoizedGraph}
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 mt-16 max-w-4xl mb-16 z-50">
      <div className="space-y-4">
        {searchResults.length > 0 ? (
          searchResults.map((api) => <ApiCard key={api._id} api={api} />)
        ) : (
          <div className="text-center text-white text-xl py-8">
            No APIs found matching your search.
          </div>
        )}
      </div>
    </section>
  );
}

export default Content;
