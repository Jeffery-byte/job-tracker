import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Building, MapPin, ExternalLink, Edit2, Trash2, Loader, BarChart3 } from 'lucide-react';
import { supabase } from './supabaseClient';
import PipelineProgress, { PipelinePhaseIndicator } from './PipelineProgress';
import QuickActions from './QuickActions';
import { 
  PIPELINE_STAGES, 
  PIPELINE_PHASES,
  getAllStagesInOrder,
  getStagesByPhase,
  getStageConfig,
  getDaysInStage 
} from './pipelineConfig';

const JobTracker = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [phaseFilter, setPhaseFilter] = useState('All');
  const [submitting, setSubmitting] = useState(false);
  const [logoCache, setLogoCache] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [companySuggestions, setCompanySuggestions] = useState([]);
  const [showPipelineView, setShowPipelineView] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [formData, setFormData] = useState({
    company: '',
    position: '',
    pipeline_stage: 'Applied',
    applied_date: '',
    location: '',
    job_url: '',
    notes: '',
    priority: 'Medium',
    expected_next_step: '',
    interview_notes: {}
  });

  const priorityOptions = ['Low', 'Medium', 'High'];

  // Comprehensive company database organized by categories
  const companyDatabase = [
    // FAANG + Big Tech
    { name: 'Google', location: 'Mountain View, CA', website: 'google.com', industry: 'Technology', category: 'Big Tech' },
    { name: 'Apple', location: 'Cupertino, CA', website: 'apple.com', industry: 'Technology', category: 'Big Tech' },
    { name: 'Meta', location: 'Menlo Park, CA', website: 'meta.com', industry: 'Technology', category: 'Big Tech' },
    { name: 'Amazon', location: 'Seattle, WA', website: 'amazon.com', industry: 'E-commerce/Cloud', category: 'Big Tech' },
    { name: 'Netflix', location: 'Los Gatos, CA', website: 'netflix.com', industry: 'Entertainment', category: 'Big Tech' },
    { name: 'Microsoft', location: 'Redmond, WA', website: 'microsoft.com', industry: 'Technology', category: 'Big Tech' },

    // Cloud & Enterprise
    { name: 'Salesforce', location: 'San Francisco, CA', website: 'salesforce.com', industry: 'CRM/Cloud', category: 'Enterprise' },
    { name: 'Oracle', location: 'Austin, TX', website: 'oracle.com', industry: 'Database/Cloud', category: 'Enterprise' },
    { name: 'IBM', location: 'Armonk, NY', website: 'ibm.com', industry: 'Technology/Consulting', category: 'Enterprise' },
    { name: 'ServiceNow', location: 'Santa Clara, CA', website: 'servicenow.com', industry: 'Cloud/IT', category: 'Enterprise' },
    { name: 'Workday', location: 'Pleasanton, CA', website: 'workday.com', industry: 'HR Software', category: 'Enterprise' },
    { name: 'VMware', location: 'Palo Alto, CA', website: 'vmware.com', industry: 'Cloud/Virtualization', category: 'Enterprise' },
    { name: 'Splunk', location: 'San Francisco, CA', website: 'splunk.com', industry: 'Data Analytics', category: 'Enterprise' },

    // Semiconductors & Hardware
    { name: 'NVIDIA', location: 'Santa Clara, CA', website: 'nvidia.com', industry: 'Graphics/AI', category: 'Hardware' },
    { name: 'Intel', location: 'Santa Clara, CA', website: 'intel.com', industry: 'Semiconductors', category: 'Hardware' },
    { name: 'AMD', location: 'Santa Clara, CA', website: 'amd.com', industry: 'Semiconductors', category: 'Hardware' },
    { name: 'Qualcomm', location: 'San Diego, CA', website: 'qualcomm.com', industry: 'Semiconductors', category: 'Hardware' },
    { name: 'Broadcom', location: 'San Jose, CA', website: 'broadcom.com', industry: 'Semiconductors', category: 'Hardware' },
    { name: 'Micron Technology', location: 'Boise, ID', website: 'micron.com', industry: 'Memory/Storage', category: 'Hardware' },

    // Social Media & Communication  
    { name: 'LinkedIn', location: 'Sunnyvale, CA', website: 'linkedin.com', industry: 'Social Media', category: 'Social' },
    { name: 'Twitter', location: 'San Francisco, CA', website: 'twitter.com', industry: 'Social Media', category: 'Social' },
    { name: 'Snapchat', location: 'Santa Monica, CA', website: 'snap.com', industry: 'Social Media', category: 'Social' },
    { name: 'Pinterest', location: 'San Francisco, CA', website: 'pinterest.com', industry: 'Social Media', category: 'Social' },
    { name: 'TikTok', location: 'Culver City, CA', website: 'tiktok.com', industry: 'Social Media', category: 'Social' },
    { name: 'Discord', location: 'San Francisco, CA', website: 'discord.com', industry: 'Communication', category: 'Social' },
    { name: 'Reddit', location: 'San Francisco, CA', website: 'reddit.com', industry: 'Social Media', category: 'Social' },
    { name: 'Slack', location: 'San Francisco, CA', website: 'slack.com', industry: 'Communication', category: 'Social' },
    { name: 'Zoom', location: 'San Jose, CA', website: 'zoom.us', industry: 'Communication', category: 'Social' },

    // Fintech
    { name: 'PayPal', location: 'San Jose, CA', website: 'paypal.com', industry: 'Fintech', category: 'Fintech' },
    { name: 'Stripe', location: 'San Francisco, CA', website: 'stripe.com', industry: 'Fintech', category: 'Fintech' },
    { name: 'Square', location: 'San Francisco, CA', website: 'squareup.com', industry: 'Fintech', category: 'Fintech' },
    { name: 'Coinbase', location: 'San Francisco, CA', website: 'coinbase.com', industry: 'Cryptocurrency', category: 'Fintech' },
    { name: 'Robinhood', location: 'Menlo Park, CA', website: 'robinhood.com', industry: 'Fintech', category: 'Fintech' },
    { name: 'Plaid', location: 'San Francisco, CA', website: 'plaid.com', industry: 'Fintech', category: 'Fintech' },
    { name: 'Affirm', location: 'San Francisco, CA', website: 'affirm.com', industry: 'Fintech', category: 'Fintech' },
    { name: 'Klarna', location: 'New York, NY', website: 'klarna.com', industry: 'Fintech', category: 'Fintech' },

    // Transportation & Mobility
    { name: 'Tesla', location: 'Austin, TX', website: 'tesla.com', industry: 'Automotive/Energy', category: 'Transportation' },
    { name: 'Uber', location: 'San Francisco, CA', website: 'uber.com', industry: 'Transportation', category: 'Transportation' },
    { name: 'Lyft', location: 'San Francisco, CA', website: 'lyft.com', industry: 'Transportation', category: 'Transportation' },
    { name: 'Ford', location: 'Dearborn, MI', website: 'ford.com', industry: 'Automotive', category: 'Transportation' },
    { name: 'General Motors', location: 'Detroit, MI', website: 'gm.com', industry: 'Automotive', category: 'Transportation' },
    { name: 'Rivian', location: 'Irvine, CA', website: 'rivian.com', industry: 'Electric Vehicles', category: 'Transportation' },
    { name: 'Lucid Motors', location: 'Newark, CA', website: 'lucidmotors.com', industry: 'Electric Vehicles', category: 'Transportation' },

    // E-commerce & Marketplace
    { name: 'Shopify', location: 'Ottawa, ON', website: 'shopify.com', industry: 'E-commerce', category: 'E-commerce' },
    { name: 'eBay', location: 'San Jose, CA', website: 'ebay.com', industry: 'E-commerce', category: 'E-commerce' },
    { name: 'Etsy', location: 'Brooklyn, NY', website: 'etsy.com', industry: 'E-commerce', category: 'E-commerce' },
    { name: 'Wayfair', location: 'Boston, MA', website: 'wayfair.com', industry: 'E-commerce', category: 'E-commerce' },
    { name: 'Instacart', location: 'San Francisco, CA', website: 'instacart.com', industry: 'Grocery Delivery', category: 'E-commerce' },
    { name: 'DoorDash', location: 'San Francisco, CA', website: 'doordash.com', industry: 'Food Delivery', category: 'E-commerce' },

    // Travel & Hospitality
    { name: 'Airbnb', location: 'San Francisco, CA', website: 'airbnb.com', industry: 'Travel/Hospitality', category: 'Travel' },
    { name: 'Booking Holdings', location: 'Norwalk, CT', website: 'bookingholdings.com', industry: 'Travel', category: 'Travel' },
    { name: 'Expedia', location: 'Seattle, WA', website: 'expedia.com', industry: 'Travel', category: 'Travel' },
    { name: 'Tripadvisor', location: 'Needham, MA', website: 'tripadvisor.com', industry: 'Travel', category: 'Travel' },

    // Media & Entertainment
    { name: 'Spotify', location: 'New York, NY', website: 'spotify.com', industry: 'Music/Technology', category: 'Media' },
    { name: 'Disney', location: 'Burbank, CA', website: 'disney.com', industry: 'Entertainment', category: 'Media' },
    { name: 'Warner Bros Discovery', location: 'New York, NY', website: 'wbd.com', industry: 'Entertainment', category: 'Media' },
    { name: 'Paramount', location: 'New York, NY', website: 'paramount.com', industry: 'Entertainment', category: 'Media' },
    { name: 'Comcast', location: 'Philadelphia, PA', website: 'comcastcorporation.com', industry: 'Media/Telecom', category: 'Media' },

    // Gaming
    { name: 'Unity', location: 'San Francisco, CA', website: 'unity.com', industry: 'Game Engine', category: 'Gaming' },
    { name: 'Epic Games', location: 'Cary, NC', website: 'epicgames.com', industry: 'Gaming', category: 'Gaming' },
    { name: 'Roblox', location: 'San Mateo, CA', website: 'roblox.com', industry: 'Gaming', category: 'Gaming' },
    { name: 'Activision Blizzard', location: 'Santa Monica, CA', website: 'activisionblizzard.com', industry: 'Gaming', category: 'Gaming' },
    { name: 'Electronic Arts', location: 'Redwood City, CA', website: 'ea.com', industry: 'Gaming', category: 'Gaming' },
    { name: 'Take-Two Interactive', location: 'New York, NY', website: 'take2games.com', industry: 'Gaming', category: 'Gaming' },
    { name: 'Ubisoft', location: 'San Francisco, CA', website: 'ubisoft.com', industry: 'Gaming', category: 'Gaming' },

    // Developer Tools & DevOps
    { name: 'GitHub', location: 'San Francisco, CA', website: 'github.com', industry: 'Developer Tools', category: 'Developer Tools' },
    { name: 'GitLab', location: 'San Francisco, CA', website: 'gitlab.com', industry: 'DevOps', category: 'Developer Tools' },
    { name: 'Atlassian', location: 'San Francisco, CA', website: 'atlassian.com', industry: 'Software Tools', category: 'Developer Tools' },
    { name: 'Docker', location: 'Palo Alto, CA', website: 'docker.com', industry: 'Developer Tools', category: 'Developer Tools' },
    { name: 'HashiCorp', location: 'San Francisco, CA', website: 'hashicorp.com', industry: 'DevOps', category: 'Developer Tools' },
    { name: 'JetBrains', location: 'Boston, MA', website: 'jetbrains.com', industry: 'Developer Tools', category: 'Developer Tools' },

    // Data & Analytics
    { name: 'Palantir', location: 'Denver, CO', website: 'palantir.com', industry: 'Data Analytics', category: 'Data & Analytics' },
    { name: 'Snowflake', location: 'Bozeman, MT', website: 'snowflake.com', industry: 'Data Warehouse', category: 'Data & Analytics' },
    { name: 'Databricks', location: 'San Francisco, CA', website: 'databricks.com', industry: 'Data Analytics', category: 'Data & Analytics' },
    { name: 'MongoDB', location: 'New York, NY', website: 'mongodb.com', industry: 'Database', category: 'Data & Analytics' },
    { name: 'Elastic', location: 'Mountain View, CA', website: 'elastic.co', industry: 'Search/Analytics', category: 'Data & Analytics' },
    { name: 'Tableau', location: 'Seattle, WA', website: 'tableau.com', industry: 'Data Visualization', category: 'Data & Analytics' },

    // AI & Machine Learning
    { name: 'OpenAI', location: 'San Francisco, CA', website: 'openai.com', industry: 'Artificial Intelligence', category: 'AI/ML' },
    { name: 'Anthropic', location: 'San Francisco, CA', website: 'anthropic.com', industry: 'AI Safety', category: 'AI/ML' },
    { name: 'DeepMind', location: 'London, UK', website: 'deepmind.com', industry: 'AI Research', category: 'AI/ML' },
    { name: 'Scale AI', location: 'San Francisco, CA', website: 'scale.com', industry: 'AI Infrastructure', category: 'AI/ML' },
    { name: 'Hugging Face', location: 'New York, NY', website: 'huggingface.co', industry: 'Machine Learning', category: 'AI/ML' },

    // Cybersecurity
    { name: 'CrowdStrike', location: 'Austin, TX', website: 'crowdstrike.com', industry: 'Cybersecurity', category: 'Cybersecurity' },
    { name: 'Palo Alto Networks', location: 'Santa Clara, CA', website: 'paloaltonetworks.com', industry: 'Cybersecurity', category: 'Cybersecurity' },
    { name: 'Okta', location: 'San Francisco, CA', website: 'okta.com', industry: 'Identity Security', category: 'Cybersecurity' },
    { name: 'Zscaler', location: 'San Jose, CA', website: 'zscaler.com', industry: 'Cloud Security', category: 'Cybersecurity' },

    // Telecommunications
    { name: 'Cisco', location: 'San Jose, CA', website: 'cisco.com', industry: 'Networking', category: 'Networking' },
    { name: 'Verizon', location: 'New York, NY', website: 'verizon.com', industry: 'Telecommunications', category: 'Telecom' },
    { name: 'AT&T', location: 'Dallas, TX', website: 'att.com', industry: 'Telecommunications', category: 'Telecom' },
    { name: 'T-Mobile', location: 'Bellevue, WA', website: 't-mobile.com', industry: 'Telecommunications', category: 'Telecom' },

    // Cloud Storage & Infrastructure
    { name: 'Dropbox', location: 'San Francisco, CA', website: 'dropbox.com', industry: 'Cloud Storage', category: 'Cloud' },
    { name: 'Box', location: 'Redwood City, CA', website: 'box.com', industry: 'Cloud Storage', category: 'Cloud' },
    { name: 'Twilio', location: 'San Francisco, CA', website: 'twilio.com', industry: 'Communication APIs', category: 'Cloud' },

    // Fortune 500 Non-Tech
    { name: 'JPMorgan Chase', location: 'New York, NY', website: 'jpmorganchase.com', industry: 'Banking', category: 'Finance' },
    { name: 'Bank of America', location: 'Charlotte, NC', website: 'bankofamerica.com', industry: 'Banking', category: 'Finance' },
    { name: 'Wells Fargo', location: 'San Francisco, CA', website: 'wellsfargo.com', industry: 'Banking', category: 'Finance' },
    { name: 'Goldman Sachs', location: 'New York, NY', website: 'goldmansachs.com', industry: 'Investment Banking', category: 'Finance' },
    { name: 'Morgan Stanley', location: 'New York, NY', website: 'morganstanley.com', industry: 'Investment Banking', category: 'Finance' },
    { name: 'Blackrock', location: 'New York, NY', website: 'blackrock.com', industry: 'Asset Management', category: 'Finance' },

    // Consulting
    { name: 'McKinsey & Company', location: 'New York, NY', website: 'mckinsey.com', industry: 'Management Consulting', category: 'Consulting' },
    { name: 'Boston Consulting Group', location: 'Boston, MA', website: 'bcg.com', industry: 'Management Consulting', category: 'Consulting' },
    { name: 'Bain & Company', location: 'Boston, MA', website: 'bain.com', industry: 'Management Consulting', category: 'Consulting' },
    { name: 'Deloitte', location: 'New York, NY', website: 'deloitte.com', industry: 'Consulting', category: 'Consulting' },
    { name: 'PwC', location: 'New York, NY', website: 'pwc.com', industry: 'Professional Services', category: 'Consulting' },
    { name: 'EY', location: 'London, UK', website: 'ey.com', industry: 'Professional Services', category: 'Consulting' },
    { name: 'KPMG', location: 'New York, NY', website: 'kpmg.com', industry: 'Professional Services', category: 'Consulting' },
    { name: 'Accenture', location: 'Dublin, Ireland', website: 'accenture.com', industry: 'Technology Consulting', category: 'Consulting' },

    // Healthcare & Biotech
    { name: 'Johnson & Johnson', location: 'New Brunswick, NJ', website: 'jnj.com', industry: 'Healthcare', category: 'Healthcare' },
    { name: 'Pfizer', location: 'New York, NY', website: 'pfizer.com', industry: 'Pharmaceuticals', category: 'Healthcare' },
    { name: 'Moderna', location: 'Cambridge, MA', website: 'modernatx.com', industry: 'Biotechnology', category: 'Healthcare' },
    { name: 'Illumina', location: 'San Diego, CA', website: 'illumina.com', industry: 'Genomics', category: 'Healthcare' },

    // Aerospace
    { name: 'SpaceX', location: 'Hawthorne, CA', website: 'spacex.com', industry: 'Aerospace', category: 'Aerospace' },
    { name: 'Blue Origin', location: 'Kent, WA', website: 'blueorigin.com', industry: 'Aerospace', category: 'Aerospace' },
    { name: 'Boeing', location: 'Chicago, IL', website: 'boeing.com', industry: 'Aerospace', category: 'Aerospace' },
    { name: 'Lockheed Martin', location: 'Bethesda, MD', website: 'lockheedmartin.com', industry: 'Aerospace/Defense', category: 'Aerospace' },

    // Retail & Consumer
    { name: 'Walmart', location: 'Bentonville, AR', website: 'walmart.com', industry: 'Retail', category: 'Retail' },
    { name: 'Target', location: 'Minneapolis, MN', website: 'target.com', industry: 'Retail', category: 'Retail' },
    { name: 'Home Depot', location: 'Atlanta, GA', website: 'homedepot.com', industry: 'Retail', category: 'Retail' },
    { name: 'Nike', location: 'Beaverton, OR', website: 'nike.com', industry: 'Apparel', category: 'Retail' },

    // Energy
    { name: 'ExxonMobil', location: 'Irving, TX', website: 'exxonmobil.com', industry: 'Energy', category: 'Energy' },
    { name: 'Chevron', location: 'San Ramon, CA', website: 'chevron.com', industry: 'Energy', category: 'Energy' },

    // Hot Unicorn Startups (2024)
    { name: 'Canva', location: 'San Francisco, CA', website: 'canva.com', industry: 'Design Software', category: 'Startup' },
    { name: 'Figma', location: 'San Francisco, CA', website: 'figma.com', industry: 'Design Tools', category: 'Startup' },
    { name: 'Notion', location: 'San Francisco, CA', website: 'notion.so', industry: 'Productivity', category: 'Startup' },
    { name: 'Airtable', location: 'San Francisco, CA', website: 'airtable.com', industry: 'Database/Productivity', category: 'Startup' },
    { name: 'Miro', location: 'San Francisco, CA', website: 'miro.com', industry: 'Collaboration', category: 'Startup' },
    { name: 'Vercel', location: 'San Francisco, CA', website: 'vercel.com', industry: 'Web Development', category: 'Startup' },
    { name: 'Supabase', location: 'San Francisco, CA', website: 'supabase.com', industry: 'Backend-as-a-Service', category: 'Startup' },
    { name: 'Linear', location: 'San Francisco, CA', website: 'linear.app', industry: 'Project Management', category: 'Startup' },
  ];

  // Company logo fetching function
  const getCompanyLogo = async (companyName) => {
    if (!companyName) return null;
    
    // Check cache first
    const cacheKey = companyName.toLowerCase().trim();
    if (logoCache[cacheKey] !== undefined) {
      return logoCache[cacheKey];
    }

    console.log(`🔍 Fetching logo for: ${companyName}`);

    try {
      const domain = getCompanyDomain(companyName);
      console.log(`🌐 Using domain: ${domain}`);
      
      // Try multiple logo sources
      const logoSources = [
        // Clearbit Logo API (free tier available)
        `https://logo.clearbit.com/${domain}`,
        // Favicon as fallback
        `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
      ];

      for (let i = 0; i < logoSources.length; i++) {
        const logoUrl = logoSources[i];
        console.log(`🖼️ Trying logo source ${i + 1}:`, logoUrl);
        
        try {
          // Test if the logo loads
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Try to handle CORS
            img.onload = () => {
              console.log(`✅ Logo loaded successfully:`, logoUrl);
              resolve();
            };
            img.onerror = (error) => {
              console.log(`❌ Logo failed to load:`, logoUrl, error);
              reject();
            };
            img.src = logoUrl;
            // Set a timeout to avoid hanging
            setTimeout(() => {
              console.log(`⏰ Logo timeout:`, logoUrl);
              reject();
            }, 5000);
          });
          
          // Cache successful logo
          setLogoCache(prev => ({
            ...prev,
            [cacheKey]: logoUrl
          }));
          
          console.log(`🎉 Logo cached for ${companyName}:`, logoUrl);
          return logoUrl;
        } catch (error) {
          console.log(`⚠️ Logo source ${i + 1} failed:`, error);
          continue; // Try next source
        }
      }
      
      // Cache null result to avoid repeated attempts
      console.log(`💭 No logo found for ${companyName}, using fallback`);
      setLogoCache(prev => ({
        ...prev,
        [cacheKey]: null
      }));
      
      return null;
    } catch (error) {
      console.error('❌ Error fetching logo for', companyName, ':', error);
      // Cache null to avoid repeated attempts
      setLogoCache(prev => ({
        ...prev,
        [cacheKey]: null
      }));
      return null;
    }
  };

  // Helper function to get company domain from name
  const getCompanyDomain = (companyName) => {
    const domainMap = {
      'google': 'google.com',
      'alphabet': 'google.com',
      'microsoft': 'microsoft.com',
      'meta': 'meta.com',
      'facebook': 'meta.com',
      'amazon': 'amazon.com',
      'apple': 'apple.com',
      'netflix': 'netflix.com',
      'tesla': 'tesla.com',
      'uber': 'uber.com',
      'lyft': 'lyft.com',
      'airbnb': 'airbnb.com',
      'spotify': 'spotify.com',
      'linkedin': 'linkedin.com',
      'twitter': 'twitter.com',
      'x': 'x.com',
      'snapchat': 'snap.com',
      'snap': 'snap.com',
      'pinterest': 'pinterest.com',
      'dropbox': 'dropbox.com',
      'slack': 'slack.com',
      'zoom': 'zoom.us',
      'salesforce': 'salesforce.com',
      'adobe': 'adobe.com',
      'oracle': 'oracle.com',
      'ibm': 'ibm.com',
      'intel': 'intel.com',
      'nvidia': 'nvidia.com',
      'amd': 'amd.com',
      'cisco': 'cisco.com',
      'vmware': 'vmware.com',
      'paypal': 'paypal.com',
      'stripe': 'stripe.com',
      'square': 'squareup.com',
      'twilio': 'twilio.com',
      'shopify': 'shopify.com',
      'atlassian': 'atlassian.com',
      'github': 'github.com',
      'gitlab': 'gitlab.com',
      'docker': 'docker.com',
      'redis': 'redis.io',
      'mongodb': 'mongodb.com',
      'elastic': 'elastic.co',
      'databricks': 'databricks.com',
      'snowflake': 'snowflake.com',
      'palantir': 'palantir.com',
      'coinbase': 'coinbase.com',
      'robinhood': 'robinhood.com',
      'discord': 'discord.com',
      'reddit': 'reddit.com',
      'tiktok': 'tiktok.com',
      'bytedance': 'bytedance.com',
      'instacart': 'instacart.com',
      'doordash': 'doordash.com',
      'grubhub': 'grubhub.com',
      'peloton': 'onepeloton.com',
      'roblox': 'roblox.com',
      'unity': 'unity.com',
      'epic games': 'epicgames.com',
      'activision': 'activision.com',
      'electronic arts': 'ea.com',
      'ea': 'ea.com',
      'valve': 'valvesoftware.com',
      'steam': 'steampowered.com'
    };
    
    const normalizedName = companyName.toLowerCase().trim();
    
    // Check direct mapping first
    if (domainMap[normalizedName]) {
      return domainMap[normalizedName];
    }
    
    // For multi-word companies, try individual words
    const words = normalizedName.split(/\s+/);
    for (const word of words) {
      if (domainMap[word]) {
        return domainMap[word];
      }
    }
    
    // Default fallback - use first word + .com
    const firstWord = words[0] || normalizedName;
    return `${firstWord.replace(/[^a-z0-9]/g, '')}.com`;
  };

  // Filter company suggestions based on input
  const getCompanySuggestions = (input) => {
    if (!input || input.length < 2) return [];
    
    const searchTerm = input.toLowerCase();
    return companyDatabase
      .filter(company => 
        company.name.toLowerCase().includes(searchTerm) ||
        company.industry.toLowerCase().includes(searchTerm) ||
        company.category.toLowerCase().includes(searchTerm)
      )
      .slice(0, 8); // Increased to 8 suggestions
  };

  // Handle company input change
  const handleCompanyInputChange = (value) => {
    setFormData({...formData, company: value});
    
    if (value.length >= 2) {
      const suggestions = getCompanySuggestions(value);
      setCompanySuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
      setCompanySuggestions([]);
    }
  };

  // Handle company suggestion selection - FIXED VERSION
  const handleCompanySuggestionSelect = (company) => {
    setFormData({
      ...formData,
      company: company.name,
      location: company.location,
      job_url: `https://${company.website}/careers`
    });
    setShowSuggestions(false);
    setCompanySuggestions([]);
  };

  // Load applications from Supabase
  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const apps = data || [];
      setApplications(apps);
      
      // Prefetch logos for all companies (but don't block UI)
      apps.forEach(app => {
        if (app.company && !logoCache[app.company.toLowerCase().trim()]) {
          getCompanyLogo(app.company).catch(() => {
            // Silently handle logo fetch failures
          });
        }
      });
    } catch (error) {
      console.error('Error loading applications:', error);
      alert('Error loading applications. Check your Supabase connection.');
    } finally {
      setLoading(false);
    }
  };

  // Load applications when component mounts
  useEffect(() => {
    loadApplications();
    
    // Close dropdowns when clicking outside
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Use pipeline_stage for filtering, fallback to status for legacy data
    const currentStage = app.pipeline_stage || app.status || 'Applied';
    const stageConfig = getStageConfig(currentStage);
    
    const matchesStage = statusFilter === 'All' || currentStage === statusFilter;
    const matchesPhase = phaseFilter === 'All' || stageConfig.phase === phaseFilter;
    
    return matchesSearch && matchesStage && matchesPhase;
  });

  // Enhanced stats calculation using pipeline stages
  const calculateStats = () => {
    const stats = {
      total: applications.length,
      byPhase: {},
      byStage: {},
      averageDaysInStage: 0
    };

    // Calculate phase distribution
    Object.keys(PIPELINE_PHASES).forEach(phase => {
      stats.byPhase[phase] = applications.filter(app => {
        const currentStage = app.pipeline_stage || app.status || 'Applied';
        const stageConfig = getStageConfig(currentStage);
        return stageConfig.phase === phase;
      }).length;
    });

    // Calculate stage distribution
    Object.keys(PIPELINE_STAGES).forEach(stage => {
      stats.byStage[stage] = applications.filter(app => 
        (app.pipeline_stage || app.status) === stage
      ).length;
    });

    // Calculate average days in current stage
    const totalDays = applications.reduce((sum, app) => {
      const days = getDaysInStage(app.stage_changed_date || app.created_at);
      return sum + days;
    }, 0);
    stats.averageDaysInStage = applications.length > 0 ? Math.round(totalDays / applications.length) : 0;

    return stats;
  };

  const stats = calculateStats();

  // Handle pipeline stage changes
  const handleStageChange = async (applicationId, newStage, notes = '') => {
    try {
      // Now use the new pipeline columns since migration is complete
      const { error } = await supabase
        .from('applications')
        .update({ 
          pipeline_stage: newStage,
          status: newStage, // Keep status in sync for backward compatibility
          stage_changed_date: new Date().toISOString(),
          notes: notes || undefined
        })
        .eq('id', applicationId);

      if (error) throw error;
      
      await loadApplications(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating stage:', error);
      alert('Error updating stage: ' + error.message);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'text-red-600',
      'Medium': 'text-amber-600',
      'Low': 'text-green-600'
    };
    return colors[priority] || colors['Medium'];
  };

  const handleSubmit = async () => {
    if (!formData.company || !formData.position) return;
    setSubmitting(true);
    try {
      let error;
      
      // Now use the new pipeline columns since migration is complete
      const submitData = {
        company: formData.company,
        position: formData.position,
        status: formData.pipeline_stage, // Keep status for backward compatibility
        pipeline_stage: formData.pipeline_stage,
        applied_date: formData.applied_date,
        location: formData.location,
        job_url: formData.job_url,
        notes: formData.notes,
        priority: formData.priority,
        expected_next_step: formData.expected_next_step,
        interview_notes: formData.interview_notes,
        // Set stage_changed_date for new applications
        ...(editingId ? {} : { stage_changed_date: new Date().toISOString() })
      };

      if (editingId) {
        // Update existing application
        const res = await supabase
          .from('applications')
          .update(submitData)
          .eq('id', editingId);
        error = res.error;
      } else {
        // Insert new application
        const res = await supabase
          .from('applications')
          .insert([submitData]);
        error = res.error;
      }
      if (error) {
        console.error('Supabase error:', error);
        alert('Error saving application: ' + (error.message || JSON.stringify(error)));
        return;
      }
      
      // Prefetch logo for new/updated company (don't block the UI)
      if (formData.company) {
        getCompanyLogo(formData.company).catch(() => {
          // Silently handle logo fetch failures
        });
      }
      
      // Reload applications and reset form
      await loadApplications();
      setFormData({
        company: '',
        position: '',
        pipeline_stage: 'Applied',
        applied_date: '',
        location: '',
        job_url: '',
        notes: '',
        priority: 'Medium',
        expected_next_step: '',
        interview_notes: {}
      });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving application:', error);
      alert('Error saving application: ' + (error.message || JSON.stringify(error)));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (app) => {
    setFormData({
      company: app.company || '',
      position: app.position || '',
      pipeline_stage: app.pipeline_stage || app.status || 'Applied',
      applied_date: app.applied_date || '',
      location: app.location || '',
      job_url: app.job_url || '',
      notes: app.notes || '',
      priority: app.priority || 'Medium',
      expected_next_step: app.expected_next_step || '',
      interview_notes: app.interview_notes || {}
    });
    setEditingId(app.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadApplications();
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Error deleting application. Please try again.');
    }
  };

  // Company logo component with fallback
  const CompanyLogo = ({ companyName, className = "w-12 h-12" }) => {
    const [logoUrl, setLogoUrl] = useState(null);
    const [loadError, setLoadError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const cacheKey = companyName?.toLowerCase().trim();

    useEffect(() => {
      if (!companyName) {
        setIsLoading(false);
        return;
      }

      if (logoCache[cacheKey] !== undefined) {
        setLogoUrl(logoCache[cacheKey]);
        setIsLoading(false);
      } else {
        setIsLoading(true);
        getCompanyLogo(companyName)
          .then(url => {
            setLogoUrl(url);
            setIsLoading(false);
          })
          .catch(() => {
            setLogoUrl(null);
            setIsLoading(false);
          });
      }
    }, [companyName, logoCache, cacheKey]);

    if (!companyName) {
      return (
        <div className={`${className} bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center`}>
          <Building className="w-1/2 h-1/2 text-gray-500" />
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className={`${className} bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center`}>
          <Loader className="w-1/2 h-1/2 text-gray-500 animate-spin" />
        </div>
      );
    }

    if (logoUrl && !loadError) {
      return (
        <img
          src={logoUrl}
          alt={`${companyName} logo`}
          className={`${className} rounded-lg object-contain bg-white shadow-sm border border-gray-100`}
          onError={() => setLoadError(true)}
          onLoad={() => setLoadError(false)}
        />
      );
    }

    // Fallback to company initial with nice gradient
    const initial = companyName.charAt(0).toUpperCase();
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600', 
      'from-green-500 to-green-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-teal-500 to-teal-600',
      'from-orange-500 to-orange-600',
      'from-cyan-500 to-cyan-600'
    ];
    
    // Use company name to deterministically pick a color
    const colorIndex = companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    
    return (
      <div className={`${className} bg-gradient-to-br ${colors[colorIndex]} rounded-lg flex items-center justify-center text-white font-bold shadow-md`} style={{ fontSize: `${parseInt(className.match(/w-(\d+)/)?.[1] || '12') * 0.25}rem` }}>
        {initial}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="card mb-6 bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
              <p className="text-sm text-gray-500">
                Track and manage your job applications
              </p>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({
                  company: '',
                  position: '',
                  status: 'Applied',
                  applied_date: '',
                  location: '',
                  job_url: '',
                  notes: '',
                  priority: 'Medium'
                });
              }}
              className="btn btn-primary inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Application
            </button>
          </div>

          {/* Enhanced Pipeline Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="text-sm font-medium text-blue-100">Total Applications</div>
              <div className="mt-2 text-3xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="text-sm font-medium text-blue-100">Application Phase</div>
              <div className="mt-2 text-3xl font-bold">{stats.byPhase.application || 0}</div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="text-sm font-medium text-amber-100">Interview Phase</div>
              <div className="mt-2 text-3xl font-bold">{stats.byPhase.interview || 0}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="text-sm font-medium text-green-100">Decision Phase</div>
              <div className="mt-2 text-3xl font-bold">{stats.byPhase.decision || 0}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="text-sm font-medium text-purple-100">Avg Days/Stage</div>
              <div className="mt-2 text-3xl font-bold">{stats.averageDaysInStage}</div>
            </div>
          </div>

          {/* Enhanced Search and Filter */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search companies, positions, locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
                className="custom-select w-full sm:w-40"
              >
                <option value="All">All Phases</option>
                {Object.entries(PIPELINE_PHASES).map(([phase, config]) => (
                  <option key={phase} value={phase}>{config.label}</option>
                ))}
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="custom-select w-full sm:w-48"
              >
                <option value="All">All Stages</option>
                {getAllStagesInOrder().map(([stage, config]) => (
                  <option key={stage} value={stage}>{config.label}</option>
                ))}
              </select>
              
              <button
                onClick={() => setShowPipelineView(!showPipelineView)}
                className={`btn ${showPipelineView ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
              >
                <BarChart3 className="w-4 h-4" />
                Pipeline View
              </button>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="card mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <h3 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Application' : 'Add New Application'}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Company Name Input with Autocomplete */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Company Name *"
                  value={formData.company}
                  onChange={(e) => handleCompanyInputChange(e.target.value)}
                  onFocus={() => {
                    if (formData.company.length >= 2) {
                      const suggestions = getCompanySuggestions(formData.company);
                      setCompanySuggestions(suggestions);
                      setShowSuggestions(suggestions.length > 0);
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding suggestions to allow clicks - INCREASED DELAY
                    setTimeout(() => setShowSuggestions(false), 300);
                  }}
                  className="input"
                  autoComplete="off"
                />
                
                {/* Company Suggestions Dropdown */}
                {showSuggestions && companySuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {companySuggestions.map((company, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleCompanySuggestionSelect(company)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <CompanyLogo companyName={company.name} className="w-8 h-8 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{company.name}</div>
                            <div className="text-sm text-gray-500 truncate">{company.industry} • {company.location}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <input
                type="text"
                placeholder="Position Title *"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                className="input"
              />
              <select
                value={formData.pipeline_stage}
                onChange={(e) => setFormData({...formData, pipeline_stage: e.target.value})}
                className="custom-select"
              >
                <optgroup label="Application Phase">
                  {getStagesByPhase('application').map(([stage, config]) => (
                    <option key={stage} value={stage}>{config.label}</option>
                  ))}
                </optgroup>
                <optgroup label="Interview Phase">
                  {getStagesByPhase('interview').map(([stage, config]) => (
                    <option key={stage} value={stage}>{config.label}</option>
                  ))}
                </optgroup>
                <optgroup label="Decision Phase">
                  {getStagesByPhase('decision').map(([stage, config]) => (
                    <option key={stage} value={stage}>{config.label}</option>
                  ))}
                </optgroup>
                <optgroup label="Other">
                  {getStagesByPhase('other').map(([stage, config]) => (
                    <option key={stage} value={stage}>{config.label}</option>
                  ))}
                </optgroup>
              </select>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="custom-select"
              >
                {priorityOptions.map(priority => (
                  <option key={priority} value={priority}>{priority} Priority</option>
                ))}
              </select>
              <input
                type="date"
                value={formData.applied_date}
                onChange={(e) => setFormData({...formData, applied_date: e.target.value})}
                className="input"
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="input"
              />
              <input
                type="url"
                placeholder="Job Posting URL (optional)"
                value={formData.job_url}
                onChange={(e) => setFormData({...formData, job_url: e.target.value})}
                className="input md:col-span-2"
              />
              <textarea
                placeholder="Notes (referrals, interview details, etc.)"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="input md:col-span-2 resize-vertical"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={submitting || !formData.company || !formData.position}
                className="btn btn-primary inline-flex items-center"
              >
                {submitting && <Loader className="w-4 h-4 animate-spin mr-2" />}
                {editingId ? 'Update' : 'Add'} Application
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Applications List - Updated to Tile Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((app, index) => (
            <div 
              key={app.id} 
              className={`application-card h-full tile-enter ${activeDropdown === app.id ? 'dropdown-active' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col h-full">
                {/* Top section with logo, company, and actions */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <CompanyLogo companyName={app.company} className="w-12 h-12 flex-shrink-0 company-logo" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{app.company}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <PipelinePhaseIndicator currentStage={app.pipeline_stage || app.status || 'Applied'} compact />
                        <span className={`text-xs font-medium ${getPriorityColor(app.priority)}`}>
                          {app.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleEdit(app)}
                      className="action-button p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      title="Edit Application"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="action-button p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete Application"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Position title */}
                <p className="text-base font-medium text-gray-800 mb-3 line-clamp-2">{app.position}</p>
                
                {/* Details section */}
                <div className="space-y-2 text-sm text-gray-600 mb-4 flex-1">
                  {app.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{app.location}</span>
                    </div>
                  )}
                  {app.applied_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>Applied {new Date(app.applied_date + 'T00:00:00').toLocaleDateString()}</span>
                    </div>
                  )}
                  {app.job_url && (
                    <a
                      href={app.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">View Job Posting</span>
                    </a>
                  )}
                </div>
                
                {/* Pipeline Progress */}
                <div className="mb-4">
                  <PipelineProgress 
                    currentStage={app.pipeline_stage || app.status || 'Applied'} 
                    className="mb-3"
                  />
                  
                  {/* Quick Actions */}
                  <QuickActions
                    currentStage={app.pipeline_stage || app.status || 'Applied'}
                    stageChangedDate={app.stage_changed_date || app.created_at}
                    onStageChange={(newStage) => handleStageChange(app.id, newStage)}
                    onDropdownToggle={(isOpen) => setActiveDropdown(isOpen ? app.id : null)}
                    className="action-button"
                  />
                </div>
                
                {/* Notes section */}
                {app.notes && (
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg mt-auto">
                    <p className="text-gray-700 text-sm line-clamp-3">{app.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {filteredApplications.length === 0 && (
            <div className="col-span-full">
              <div className="card text-center py-20">
                <div className="mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="w-12 h-12 text-blue-500" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No applications found</h3>
                <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
                  {searchTerm || statusFilter !== 'All'
                    ? 'Try adjusting your search or filter criteria to find your applications.' 
                    : 'Ready to start your job search journey? Add your first application to begin tracking your progress!'}
                </p>
                {!searchTerm && statusFilter === 'All' && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary text-lg px-8 py-4"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Your First Application
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobTracker;