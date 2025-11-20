import React, { useEffect, useState, useCallback } from "react";
import { getSitters, getTags, getSpecialties } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { Search, X, Calendar, Clock } from "lucide-react";
import ResponsiveMenu from "../../components/ResponsiveMenu";
import API from "../../api/api";

const FindSitters = () => {
  const [open, setOpen] = useState(false);
  const [sitters, setSitters] = useState([]);
  const [filteredSitters, setFilteredSitters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteringAvailability, setFilteringAvailability] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [availableSpecialties, setAvailableSpecialties] = useState([]);
  
  // Filter states
  const [selectedCareType, setSelectedCareType] = useState("Pet sitting");
  const [showCareTypeDropdown, setShowCareTypeDropdown] = useState(false);
  const [selectedPetTypes, setSelectedPetTypes] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [displayedSpecialties, setDisplayedSpecialties] = useState([]);
  
  const navigate = useNavigate();

  const careTypes = [
    "Pet sitting",
    "Pet boarding",
    "Doggy daycare",
    "Dog walking",
    "House sitting"
  ];

  // Display only these specialties (pet types)
  const priorityPetTypes = [
    "Birds",
    "Cats", 
    "Dogs",
    "Exotic Pets",
    "Fish",
    "Guinea Pigs",
    "Rabbits",
    "Reptiles"
  ];
  
  // Handle responsive menu
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCareTypeDropdown && !event.target.closest('.relative')) {
        setShowCareTypeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCareTypeDropdown]);

  const getSitterImageUrl = (sitter, index) => {
    if (sitter.profile_picture_url) {
      if (sitter.profile_picture_url.startsWith("http")) {
        return sitter.profile_picture_url;
      }
      return `http://127.0.0.1:8000${sitter.profile_picture_url}`;
    }
    // Default placeholder image
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(sitter.display_name || 'Sitter')}&background=5d4233&color=fff&size=128`;
  };

  const togglePetType = (petTypeName) => {
    setSelectedPetTypes(prev =>
      prev.includes(petTypeName)
        ? prev.filter(type => type !== petTypeName)
        : [...prev, petTypeName]
    );
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const removeSkill = (skill) => {
    setSelectedSkills(prev => prev.filter(s => s !== skill));
  };

  const clearAllFilters = () => {
    setSelectedPetTypes([]);
    setSelectedSkills([]);
    setDateFrom("");
    setDateTo("");
    setTimeFrom("");
    setTimeTo("");
  };

  // Check if a sitter is available for the requested time period
  const checkSitterAvailability = async (sitterId, requestStart, requestEnd) => {
    try {
      const response = await API.get("availability/", { params: { sitter: sitterId } });
      const availabilitySlots = response.data;
      
      if (!availabilitySlots || availabilitySlots.length === 0) {
        return false;
      }

      const requestStartTime = requestStart.getTime();
      const requestEndTime = requestEnd.getTime();

      const hasAvailability = availabilitySlots.some(slot => {
        if (slot.status !== 'open') {
          return false;
        }
        
        const slotStart = new Date(slot.start_ts);
        const slotEnd = new Date(slot.end_ts);
        const slotStartTime = slotStart.getTime();
        const slotEndTime = slotEnd.getTime();
        
        return slotStartTime <= requestStartTime && slotEndTime >= requestEndTime;
      });

      return hasAvailability;
    } catch (error) {
      console.error(`Error checking availability for sitter ${sitterId}:`, error);
      return false;
    }
  };

  // Filter sitters by availability
  const filterByAvailability = async (sittersToFilter) => {
    if (!dateFrom || !dateTo || !timeFrom || !timeTo) {
      return sittersToFilter;
    }

    setFilteringAvailability(true);
    
    const requestStart = new Date(`${dateFrom}T${timeFrom}`);
    const requestEnd = new Date(`${dateTo}T${timeTo}`);

    const availableList = [];
    
    for (const sitter of sittersToFilter) {
      const isAvailable = await checkSitterAvailability(
        sitter.id,
        requestStart,
        requestEnd
      );
      if (isAvailable) {
        availableList.push(sitter);
      }
    }
    
    setFilteringAvailability(false);
    return availableList;
  };

  const applyFilters = useCallback(async () => {
    let filtered = [...sitters];

    // Pet type filter - using specialties (which come as slugs from PublicSitterCardSerializer)
    if (selectedPetTypes.length > 0) {
      filtered = filtered.filter(sitter => {
        if (!sitter.specialties || sitter.specialties.length === 0) return false;
        
        return selectedPetTypes.some(petTypeName => {
          // Find the specialty object from displayedSpecialties that matches the selected name
          const selectedSpecialty = displayedSpecialties.find(
            spec => spec.name === petTypeName
          );
          
          if (!selectedSpecialty) return false;
          
          // Check if sitter's specialties (which are slugs) include this specialty's slug
          return sitter.specialties.includes(selectedSpecialty.slug);
        });
      });
    }

    // Skills filter - using tags (which come as tag names from PublicSitterCardSerializer)
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(sitter =>
        selectedSkills.some(skill =>
          sitter.tags?.includes(skill)
        )
      );
    }

    // Date/time availability filter
    if (dateFrom && dateTo && timeFrom && timeTo) {
      filtered = await filterByAvailability(filtered);
    }

    setFilteredSitters(filtered);
  }, [sitters, selectedPetTypes, selectedSkills, dateFrom, dateTo, timeFrom, timeTo, displayedSpecialties]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sittersData, tagsData, specialtiesData] = await Promise.all([
        getSitters(),
        getTags().catch(() => []),
        getSpecialties().catch(() => [])
      ]);
      
      setSitters(sittersData);
      setFilteredSitters(sittersData);
      setAvailableTags(tagsData);
      setAvailableSpecialties(specialtiesData);
      
      // Filter specialties to show only priority pet types
      const filteredSpecialties = specialtiesData.filter(spec => 
        priorityPetTypes.some(priority => 
          spec.name.toLowerCase() === priority.toLowerCase()
        )
      );
      
      // Sort to match priority order
      const sortedSpecialties = priorityPetTypes
        .map(priority => filteredSpecialties.find(spec => 
          spec.name.toLowerCase() === priority.toLowerCase()
        ))
        .filter(Boolean);
      
      setDisplayedSpecialties(sortedSpecialties);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const hasActiveFilters = selectedPetTypes.length > 0 || selectedSkills.length > 0;

  // Get top skills from available tags (professional skills)
  const topSkills = availableTags.slice(0, 10).map(tag => tag.name);

  return (
    <>
      <ResponsiveMenu open={open} />
      
      <div className="min-h-screen bg-white pt-20">
        {/* Search Bar */}
        <div className="bg-white border-b">
          <div className="w-[80%] mx-auto py-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Care Type Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowCareTypeDropdown(!showCareTypeDropdown)}
                  className="flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-full text-primary font-semibold hover:bg-gray-100 transition border border-gray-200"
                >
                  <div className="text-left">
                    <div className="text-xs text-gray-500">Care type</div>
                    <div className="text-sm font-semibold">{selectedCareType}</div>
                  </div>
                  <svg 
                    className={`w-4 h-4 transition-transform ${showCareTypeDropdown ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {showCareTypeDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-primary mb-4">What kind of help do you need?</h3>
                      <div className="space-y-2">
                        {careTypes.map((type) => (
                          <button
                            key={type}
                            onClick={() => {
                              setSelectedCareType(type);
                              setShowCareTypeDropdown(false);
                            }}
                            className={`w-full p-4 rounded-xl text-left transition-all hover:bg-gray-50 border-2 ${
                              selectedCareType === type
                                ? "border-primary bg-blue-50"
                                : "border-gray-200"
                            }`}
                          >
                            <span className="text-base font-medium text-primary">{type}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Date From */}
              <div className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                <Calendar className="w-4 h-4 text-gray-600" />
                <div>
                  <div className="text-xs text-gray-500">From</div>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="text-sm font-medium border-none outline-none bg-transparent cursor-pointer"
                    placeholder="Add Dates"
                  />
                </div>
              </div>

              {/* Date To */}
              <div className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                <Calendar className="w-4 h-4 text-gray-600" />
                <div>
                  <div className="text-xs text-gray-500">To</div>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="text-sm font-medium border-none outline-none bg-transparent cursor-pointer"
                    placeholder="Add Dates"
                  />
                </div>
              </div>

              {/* Time From */}
              <div className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                <Clock className="w-4 h-4 text-gray-600" />
                <div>
                  <div className="text-xs text-gray-500">From</div>
                  <input
                    type="time"
                    value={timeFrom}
                    onChange={(e) => setTimeFrom(e.target.value)}
                    className="text-sm font-medium border-none outline-none bg-transparent cursor-pointer"
                    placeholder="Add times"
                  />
                </div>
              </div>

              {/* Time To */}
              <div className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                <Clock className="w-4 h-4 text-gray-600" />
                <div>
                  <div className="text-xs text-gray-500">To</div>
                  <input
                    type="time"
                    value={timeTo}
                    onChange={(e) => setTimeTo(e.target.value)}
                    className="text-sm font-medium border-none outline-none bg-transparent cursor-pointer"
                    placeholder="Add times"
                  />
                </div>
              </div>

              {/* Search Button */}
              <button 
                onClick={applyFilters}
                disabled={filteringAvailability}
                className="bg-secondary text-white p-3 rounded-full hover:bg-secondary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {filteringAvailability ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Availability Filter Info */}
        {dateFrom && dateTo && timeFrom && timeTo && (
          <div className="bg-blue-50 border-b border-blue-200">
            <div className="w-[80%] mx-auto py-3">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Clock size={16} />
                <span>
                  Showing only sitters available from {dateFrom} {timeFrom} to {dateTo} {timeTo}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Pills */}
        {hasActiveFilters && (
          <div className="bg-white border-b">
            <div className="w-[80%] mx-auto py-3">
              <div className="flex flex-wrap items-center gap-2">
                {selectedSkills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm text-primary"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => removeSkill(skill)}
                      className="hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {selectedPetTypes.map((petType) => (
                  <div
                    key={petType}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm text-primary"
                  >
                    <span>{petType}</span>
                    <button
                      onClick={() => togglePetType(petType)}
                      className="hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="w-[80%] mx-auto py-8">
          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <aside className="w-80 flex-shrink-0">
              <div className="bg-[#f0e6e4] rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-primary">Filters</h2>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-secondary hover:text-secondary/80 font-medium underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Pet Type Filter */}
                <div className="mb-6">
                  <h3 className="font-semibold text-primary mb-3">Pet type</h3>
                  <div className="flex flex-wrap gap-2">
                    {displayedSpecialties.map((specialty) => (
                      <button
                        key={specialty.id}
                        onClick={() => togglePetType(specialty.name)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                          selectedPetTypes.includes(specialty.name)
                            ? "bg-primary text-white"
                            : "bg-white text-primary border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {specialty.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Professional Skills Filter */}
                <div className="mb-6">
                  <h3 className="font-semibold text-primary mb-3">
                    Professional skills
                  </h3>
                  <div className="space-y-2">
                    {topSkills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`w-full px-4 py-2 rounded-full text-sm font-medium text-left transition ${
                          selectedSkills.includes(skill)
                            ? "bg-primary text-white"
                            : "bg-white text-primary border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Sitters Grid */}
            <main className="flex-1">
              {loading || filteringAvailability ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent"></div>
                  <p className="mt-4 text-primary">
                    {filteringAvailability ? 'Checking sitter availability...' : 'Loading caregivers...'}
                  </p>
                </div>
              ) : filteredSitters.length === 0 ? (
                <div className="text-center py-12 bg-red-50 rounded-xl border-2 border-red-200">
                  <X className="mx-auto mb-3 text-red-400" size={48} />
                  <p className="text-primary text-lg font-medium">
                    No caregivers found matching your criteria.
                  </p>
                  {dateFrom && dateTo && timeFrom && timeTo ? (
                    <>
                      <p className="text-red-600 text-sm mt-2">
                        No sitters have open availability for {dateFrom} {timeFrom} to {dateTo} {timeTo}
                      </p>
                      <p className="text-red-500 text-sm mt-1">Try selecting different dates or times</p>
                    </>
                  ) : null}
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 text-secondary hover:text-secondary/80 font-medium underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredSitters.map((sitter, index) => (
                    <div
                      key={sitter.id}
                      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                    >
                      <div className="flex gap-6 p-6">
                        {/* Sitter Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={getSitterImageUrl(sitter, index)}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(sitter.display_name || 'Sitter')}&background=5d4233&color=fff&size=128`;
                            }}
                            alt={sitter.display_name || "Pet sitter"}
                            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                          />
                        </div>

                        {/* Sitter Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-semibold text-primary">
                                  {sitter.display_name || "Unknown Sitter"}
                                </h3>
                                <svg
                                  className="w-5 h-5 text-secondary"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <p className="text-gray-600 text-sm">
                                Westminster, CA {sitter.home_zip || ""}
                              </p>
                            </div>

                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">
                                ${sitter.rate_hourly || "?"}
                                <span className="text-sm font-normal text-gray-600">
                                  /night
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={
                                    i < Math.round(sitter.avg_rating || 0)
                                      ? "text-yellow-500"
                                      : "text-gray-300"
                                  }
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-primary text-sm font-medium">
                              {sitter.avg_rating?.toFixed(1) || "N/A"}
                            </span>
                            {sitter.review_count && (
                              <span className="text-gray-500 text-sm">
                                ({sitter.review_count})
                              </span>
                            )}
                          </div>

                          {/* Experience/Bio Preview */}
                          {sitter.bio && (
                            <p className="text-primary text-sm mb-3 line-clamp-2">
                              {sitter.bio}
                            </p>
                          )}

                          {/* Tags */}
                          {sitter.tags && sitter.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {sitter.tags.slice(0, 4).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="bg-secondary/10 text-secondary text-xs font-semibold px-3 py-1 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              {sitter.tags.length > 4 && (
                                <span className="text-gray-500 text-xs self-center">
                                  +{sitter.tags.length - 4} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Contact Button */}
                          <button
                            onClick={() => navigate(`/sitter/${sitter.id}`)}
                            className="bg-secondary text-white px-6 py-2 rounded-full hover:bg-secondary/90 transition font-medium"
                          >
                            Contact
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default FindSitters;