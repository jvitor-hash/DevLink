import SearchFiltering from "@/features/project/components/filtering_search";

export default function Projects() {
  return (
    <>
      <div className="flex gap-2">
        {/* Search Filters */}
        <SearchFiltering/>

        {/* Content */}
        <div className="flex flex-col">
          
        </div>
      </div>
    </>
  );
}