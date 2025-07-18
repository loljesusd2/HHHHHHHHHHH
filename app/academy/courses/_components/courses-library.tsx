
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  SlidersHorizontal,
  BookOpen,
  Star,
  Users,
  Clock,
  ChevronDown,
  Grid3X3,
  List,
  TrendingUp
} from 'lucide-react'
import { CourseCard } from '@/components/academy/course-card'
import { useAcademyCourses } from '@/hooks/use-academy-courses'
import { COURSE_CATEGORIES, COURSE_LEVELS } from '@/lib/types'

export function CoursesLibrary() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const { courses, loading, loadMore, hasMore, pagination } = useAcademyCourses({
    search: searchTerm,
    category: selectedCategory,
    level: selectedLevel,
    limit: 12
  })

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === 'all' ? '' : value)
  }

  const handleLevelChange = (value: string) => {
    setSelectedLevel(value === 'all' ? '' : value)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedLevel('')
    setSortBy('featured')
  }

  const activeFiltersCount = [selectedCategory, selectedLevel, searchTerm].filter(Boolean).length

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-gray-900"
        >
          Course Library
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 max-w-2xl mx-auto"
        >
          Explore our comprehensive library of beauty courses taught by industry experts. 
          Master new skills and advance your career.
        </motion.p>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/80 backdrop-blur-sm"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-purple-500 text-white">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="bg-white/80 backdrop-blur-sm"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="bg-white/80 backdrop-blur-sm"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Category
                      </label>
                      <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {Object.entries(COURSE_CATEGORIES).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Level
                      </label>
                      <Select value={selectedLevel} onValueChange={handleLevelChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          {Object.entries(COURSE_LEVELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="w-full"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between"
      >
        <div className="text-gray-600">
          {pagination.totalCount > 0 ? (
            <span>
              Showing {courses.length} of {pagination.totalCount} courses
            </span>
          ) : (
            <span>No courses found</span>
          )}
        </div>
        
        {(searchTerm || selectedCategory || selectedLevel) && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                Search: {searchTerm}
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="secondary" className="text-xs">
                {COURSE_CATEGORIES[selectedCategory as keyof typeof COURSE_CATEGORIES]}
              </Badge>
            )}
            {selectedLevel && (
              <Badge variant="secondary" className="text-xs">
                {COURSE_LEVELS[selectedLevel as keyof typeof COURSE_LEVELS]}
              </Badge>
            )}
          </div>
        )}
      </motion.div>

      {/* Course Grid */}
      <div className="space-y-8">
        {loading && courses.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1 max-w-4xl mx-auto'
            }`}>
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CourseCard 
                    course={course}
                    className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300"
                  />
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center">
                <Button
                  onClick={loadMore}
                  variant="outline"
                  disabled={loading}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  {loading ? 'Loading...' : 'Load More Courses'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse all courses.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
