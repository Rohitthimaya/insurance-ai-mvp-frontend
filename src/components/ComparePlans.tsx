import { Mic, AudioLines } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import AskAIBox from "../components/Askbot"

interface InsurancePlan {
  id: number;
  provider: string;
  type: string;
  price: number;
  coverage: string;
  region: string;
  rating: number;
  term: string;
  benefits: string[];
  cashback?: number;
  icon?: string;
  url?: string;
}

export default function ComparePlans() {
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero section state
  const [question, setQuestion] = useState("");
  const [heroLoading, setHeroLoading] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [regionFilter, setRegionFilter] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [benefitsFilter, setBenefitsFilter] = useState<string[]>([]);
  const [termFilter, setTermFilter] = useState<string>("All");
  const [cashbackOnly, setCashbackOnly] = useState<boolean>(false);

  // Fetch plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/insurance");
        setPlans(response.data);
      } catch (error) {
        console.error("Failed to fetch plans", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleBuy = async (plan: InsurancePlan) => {
    try {
      const token = localStorage.getItem("token"); // get logged-in user's token
      if (!token) {
        alert("Please log in to buy a plan.");
        return;
      }

      await axios.post(
        "http://localhost:3000/buy-plan",
        { planId: plan.id, planData: plan },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Plan added to your account!");
    } catch (err) {
      console.error("Failed to add plan", err);
      alert("Failed to add plan. Try again.");
    }
  };


  // Hero ask AI send
  const handleSend = async () => {
    if (!question.trim()) return;
    setHeroLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/api/insurance/ask", {
        question,
      });

      console.log("AI Response:", response.data);

      // Apply filters if they exist
      const filters = response.data;
      if (filters) {
        if (filters.type) setTypeFilter(filters.type);
        if (filters.region) setRegionFilter(filters.region);
        if (filters.term) setTermFilter(filters.term);
        if (filters.minRating !== undefined) setRatingFilter(Number(filters.minRating));

        if (filters.cashbackOnly !== undefined) setCashbackOnly(filters.cashbackOnly);

        if (filters.priceRange) {
          const match = filters.priceRange.match(/\$?(\d+)\s*-\s*\$?(\d+)/);
          if (match) {
            const min = Number(match[1]);
            const max = Number(match[2]);
            setPriceRange([min, max]);
          }
        }

        if (Array.isArray(filters.benefits)) {
          setBenefitsFilter(filters.benefits);
        }
      }
    } catch (error) {
      console.error("Failed to get answer", error);
    } finally {
      setHeroLoading(false);
      setQuestion("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  // Global loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  // Filtered plans
  const filteredPlans = plans.filter(plan =>
    (typeFilter === "All" || plan.type === typeFilter) &&
    (regionFilter === "All" || plan.region === regionFilter) &&
    plan.price >= priceRange[0] && plan.price <= priceRange[1] &&
    plan.rating >= ratingFilter &&
    (termFilter === "All" || plan.term === termFilter) &&
    (!cashbackOnly || (plan.cashback && plan.cashback > 0)) &&
    (benefitsFilter.length === 0 || benefitsFilter.every(b => plan.benefits.includes(b)))
  );

  // Unique dropdowns
  const types = Array.from(new Set(plans.map(p => p.type)));
  const regions = Array.from(new Set(plans.map(p => p.region)));
  const terms = Array.from(new Set(plans.map(p => p.term)));
  const allBenefits = Array.from(new Set(plans.flatMap(p => p.benefits)));

  const minPrice = Math.min(...plans.map(p => p.price));
  const maxPrice = Math.max(...plans.map(p => p.price));

  return (
    <>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-28 bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 text-white">
        <h2 className="text-4xl md:text-5xl font-bold mb-10">
          Buy insurance as easily as ordering food
        </h2>

        <div className="flex items-center w-full max-w-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-full px-5 py-4 shadow-2xl border border-white/10 backdrop-blur-md mb-4">
          <span className="text-white/80 pr-3 text-xl">+</span>
          <input
            type="text"
            placeholder="Ask anything"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 bg-transparent outline-none text-white placeholder-white/60 text-lg"
            disabled={heroLoading}
          />
          <button
            onClick={handleSend}
            className="p-2 text-white/80 hover:text-white transition font-medium"
            disabled={heroLoading}
          >
            {heroLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Send"
            )}
          </button>
          <button className="p-2 text-white/80 hover:text-white transition">
            <Mic size={22} />
          </button>
          <button className="p-2 text-white/80 hover:text-white transition">
            <AudioLines size={22} />
          </button>
        </div>
      </section>

      {/* Compare Plans Section */}
      <section className="py-16 px-6 bg-[#F6F9FC] min-h-100vh">
        <h2 className="text-4xl font-extrabold text-[#0A2540] text-center mb-8">
          Compare Insurance Plans
        </h2>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full md:w-1/4 bg-white p-6 rounded-2xl shadow-lg space-y-4">
            <h3 className="text-xl font-semibold mb-4">Filters</h3>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
            >
              <option value="All">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
            >
              <option value="All">All Regions</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>

            <select
              value={termFilter}
              onChange={e => setTermFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
            >
              <option value="All">All Terms</option>
              {terms.map(term => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>

            <div>
              <label className="font-medium">Price Range: ${priceRange[0]} - ${priceRange[1]}</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[0]}
                  onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-full"
                />
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="font-medium">Min Rating:</label>
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={ratingFilter}
                onChange={e => setRatingFilter(Number(e.target.value))}
                className="w-full px-2 py-1 border rounded-lg mt-1"
              />
            </div>

            <div>
              <label className="font-medium mb-2">Benefits:</label>
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                {allBenefits.map(b => (
                  <label key={b} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full cursor-pointer">
                    <input
                      type="checkbox"
                      checked={benefitsFilter.includes(b)}
                      onChange={e => {
                        if (e.target.checked) {
                          setBenefitsFilter([...benefitsFilter, b]);
                        } else {
                          setBenefitsFilter(benefitsFilter.filter(f => f !== b));
                        }
                      }}
                    />
                    {b}
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={cashbackOnly}
                onChange={e => setCashbackOnly(e.target.checked)}
              />
              Only Cashback
            </label>
          </div>

          {/* Plans */}
          <div className="w-full md:w-3/4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlans.map(plan => (
              <div key={plan.id} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
                {plan.icon && <img src={plan.icon} alt={plan.provider} className="w-20 h-20 mb-4 mx-auto" />}
                <h3 className="text-xl font-semibold text-[#635BFF] mb-2">{plan.provider}</h3>
                <p className="text-gray-600 mb-2">{plan.type} Insurance</p>
                <p className="text-gray-700 mb-2">{plan.coverage}</p>
                <p className="text-gray-700 mb-2">Region: <span className="font-medium">{plan.region}</span></p>
                <p className="text-gray-700 mb-2">Term: <span className="font-medium">{plan.term}</span></p>

                <div className="flex flex-wrap gap-2 mb-2">
                  {plan.benefits.map((b, i) => (
                    <span key={i} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                      {b}
                    </span>
                  ))}
                </div>

                {plan.cashback && <p className="text-green-600 font-medium mb-2">Cashback: ${plan.cashback}</p>}
                <p className="text-gray-900 font-bold text-lg mb-4">${plan.price} / month</p>
                <p className="text-yellow-500 mb-4">Rating: {plan.rating} ⭐</p>
                <button
                  onClick={() => handleBuy(plan)}
                  className="w-full px-4 py-2 bg-[#635BFF] text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Buy Now
                </button>

              </div>
            ))}
          </div>
        </div>
      </section>
      < AskAIBox/>
    </>
  );
}
