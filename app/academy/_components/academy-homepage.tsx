
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { 
  Search, 
  Play, 
  BookOpen, 
  Users, 
  Star, 
  Trophy,
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react'
import { CourseCard } from '@/components/academy/course-card'
import { AcademyStats } from '@/components/academy/academy-stats'
import { InstructorProfileComponent } from '@/components/academy/instructor-profile'
import { useAcademyCourses } from '@/hooks/use-academy-courses'
import { useUserAcademyStats } from '@/hooks/use-academy-stats'
import { COURSE_CATEGORIES } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'

export function AcademyHomepage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  
  const { courses, loading } = useAcademyCourses({ 
    featured: true, 
    limit: 8 
  })
  
  const { stats, loading: statsLoading } = useUserAcademyStats()

  // Mock instructor data (Ariana)
  const ariana = {
    id: 'ariana-instructor',
    name: 'Ariana Martinez',
    email: 'ariana@beautyacademy.com',
    avatar: 'https://static.vecteezy.com/system/resources/previews/044/245/225/non_2x/smiling-woman-holding-makeup-brushes-on-a-clear-background-png.png',
    role: 'PROFESSIONAL' as const,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date(),
    instructorProfile: {
      id: 'ariana-profile',
      userId: 'ariana-instructor',
      bio: 'Master beauty educator with 15+ years experience. Former celebrity makeup artist and beauty entrepreneur.',
      specializations: ['Hair', 'Makeup', 'Business', 'Advanced Techniques'],
      yearsExperience: 15,
      certifications: [
        'Celebrity Makeup Artist Certification',
        'Advanced Hair Styling Certification',
        'Beauty Business Management',
        'International Beauty Education License'
      ],
      portfolioImages: [
        'https://i.pinimg.com/originals/4a/cb/de/4acbdefaec57b77c368967927401f956.jpg',
        'https://i.pinimg.com/736x/4b/09/c5/4b09c5badd732c96c26cf8fc9da6b98f.jpg',
        'https://janasacademy.files.wordpress.com/2022/09/what-are-your-career-options-as-a-cosmetology-teacher.png?w=1024',
        'https://i.pinimg.com/736x/da/5f/3a/da5f3a45df9db2f8932275f58487e286.jpg'
      ],
      instagram: 'https://instagram.com/ariana_beauty_pro',
      youtube: 'https://youtube.com/@ArianaBeautyAcademy',
      website: 'https://arianabeautyacademy.com',
      totalCourses: 24,
      totalStudents: 12847,
      averageRating: 4.9,
      totalEarnings: 489750,
      isActive: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date()
    }
  }

  const heroVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5 }
    }
  }

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 opacity-90" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        
        <motion.div 
          variants={heroVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center max-w-4xl mx-auto px-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white mb-6"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">Premium Beauty Education</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Beauty <span className="text-yellow-300">Academy</span>
          </h1>
          
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Master beauty skills with expert-led courses, earn certifications, and transform your career with hands-on learning from industry professionals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/academy/courses">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-3">
                <Play className="w-5 h-5 mr-2" />
                Start Learning
              </Button>
            </Link>
            <Link href="/academy/certifications">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600 font-semibold px-8 py-3">
                <Trophy className="w-5 h-5 mr-2" />
                View Certifications
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* User Stats */}
        {stats && !statsLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <AcademyStats 
              stats={stats} 
              type="user" 
              title="Your Learning Journey"
              className="bg-white/80 backdrop-blur-sm"
            />
          </motion.div>
        )}

        {/* Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-800 mb-2">Browse Courses</h3>
              <p className="text-purple-600 mb-4">Explore our comprehensive library of beauty courses</p>
              <Link href="/academy/courses">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  View All Courses
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-100 to-pink-200 border-pink-300 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-pink-800 mb-2">My Courses</h3>
              <p className="text-pink-600 mb-4">Continue your learning journey</p>
              <Link href="/academy/my-courses">
                <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                  My Learning
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-orange-800 mb-2">Certifications</h3>
              <p className="text-orange-600 mb-4">Earn industry-recognized certificates</p>
              <Link href="/academy/certifications">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  Get Certified
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Featured Courses */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">Featured Courses</h2>
            <Link href="/academy/courses">
              <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                View All
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CourseCard 
                    course={course}
                    className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Meet Your Instructor */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Your Instructor</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Learn from industry expert Ariana Martinez, who has trained thousands of beauty professionals worldwide.
            </p>
          </div>

          <InstructorProfileComponent 
            instructor={ariana}
            variant="card"
            className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm"
          />
        </motion.section>

        {/* Categories */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Course Categories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our comprehensive range of beauty education programs designed for all skill levels.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(COURSE_CATEGORIES).map(([key, label], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href={`/academy/courses?category=${key}`}>
                  <Card className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{label}</h3>
                      <p className="text-sm text-gray-600">Professional courses</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center py-16"
        >
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Beauty Career?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of beauty professionals who have advanced their careers with our premium education platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/academy/courses">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-3">
                    <Play className="w-5 h-5 mr-2" />
                    Start Learning Today
                  </Button>
                </Link>
                <Link href="/academy/certifications">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600 font-semibold px-8 py-3">
                    <Trophy className="w-5 h-5 mr-2" />
                    View Certifications
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  )
}
