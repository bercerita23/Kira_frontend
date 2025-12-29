import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Search, List, Grid } from "lucide-react";
import React from "react";

interface StudentToolbarProps {
  search: string;
  setSearch: (val: string) => void;
  showFilter: boolean;
  setShowFilter: (val: boolean) => void;
  selectedGrades: string[];
  setSelectedGrades: (grades: string[]) => void;
  students: { grade?: string }[];
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  onAddStudent: () => void;
}

const GRADES = ["3rd", "4th", "5th", "6th", "7th"];

const StudentToolbar: React.FC<StudentToolbarProps> = ({
  search,
  setSearch,
  showFilter,
  setShowFilter,
  selectedGrades,
  setSelectedGrades,
  students,
  viewMode,
  setViewMode,
  onAddStudent,
}) => {
  return (
    <div className="flex items-center gap-2 w-full md:w-auto">
      {/* Search */}
      <div className="relative flex-1 md:w-64">
        <Input
          type="text"
          placeholder="Search Students"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      {/* Filter */}
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          className={`ml-2 ${
            selectedGrades.length > 0 ? "text-[#B40000]" : ""
          }`}
          onClick={() => setShowFilter(!showFilter)}
        >
          <Filter className="h-5 w-5" />
        </Button>
        {selectedGrades.length > 0 && (
          <div className="absolute -top-1 -right-1 bg-[#B40000] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {selectedGrades.length}
          </div>
        )}
      </div>
      {/* Filter Popover */}
      {showFilter && (
        <div className="absolute mt-[280px] mr-12 w-64 right-0 bg-white rounded-lg shadow-xl p-4 z-50 border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-lato font-[600]">Filter Results</h3>
            <button onClick={() => setShowFilter(false)}>✕</button>
          </div>
          <hr className="mb-3" />
          <div className="mb-4">
            <p className="text-sm font-lato font-[500] mb-2">Grade</p>
            {GRADES.map((grade) => (
              <label
                key={grade}
                className="flex items-center justify-between mb-2"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedGrades.includes(grade)}
                    onChange={() => {
                      setSelectedGrades(
                        selectedGrades.includes(grade)
                          ? selectedGrades.filter((g) => g !== grade)
                          : [...selectedGrades, grade]
                      );
                    }}
                  />
                  <span>{grade}</span>
                </div>
                <span className="text-xs text-gray-500">
                  ({students.filter((s) => s.grade === grade).length})
                </span>
              </label>
            ))}
          </div>
          <Button
            onClick={() => setShowFilter(false)}
            className="w-full bg-green-600 text-white rounded-sm font-lato font-[500]"
          >
            Apply
          </Button>
          <button
            className="mt-2 text-sm text-green-600 underline w-full font-lato font-[400]"
            onClick={() => setSelectedGrades([])}
          >
            Clear Filters
          </button>
        </div>
      )}
      {/* View Mode Toggle */}
      <div className="flex items-center ml-2 border rounded overflow-hidden">
        <button
          className={`px-2 py-1 ${viewMode === "list" ? "bg-gray-200" : ""}`}
          onClick={() => setViewMode("list")}
          aria-label="List view"
          type="button"
        >
          <List className="h-5 w-5" />
        </button>
        <button
          className={`px-2 py-1 ${viewMode === "grid" ? "bg-gray-200" : ""}`}
          onClick={() => setViewMode("grid")}
          aria-label="Grid view"
          type="button"
        >
          <Grid className="h-5 w-5" />
        </button>
      </div>
      {/* Add Student Button */}
      <Button
        className="ml-2 bg-green-600 hover:bg-green-700 font-lato font-[500]"
        onClick={onAddStudent}
      >
        Add a Student
      </Button>
    </div>
  );
};

export default StudentToolbar;
