import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Edit, Trash2, Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const Pages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const fetchPages = async () => {
    // Only set loading true on initial load if pages is empty to avoid flicker on refresh
    if (pages.length === 0) setLoading(true);
    try {
      const pagesSnapshot = await getDocs(collection(db, 'pages'));
      const pagesData = pagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPages(pagesData);
    } catch (error) {
      console.error('Error fetching pages:', error);
      // Don't show toast on every error if it might be transient connectivity
      if (navigator.onLine) {
        toast.error('Failed to fetch pages');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pageId) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;

    try {
      await deleteDoc(doc(db, 'pages', pageId));
      toast.success('Page deleted successfully');
      fetchPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center pb-4 border-b border-border/40">
          <div>
            <h1
              className="text-4xl font-bold text-primary mb-2"
              style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.02em' }}
            >
              Pages
            </h1>
            <p className="text-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
              Manage your website pages
            </p>
          </div>


          <div className="flex gap-2">
            <button
              onClick={async () => {
                if (!window.confirm("Seed ALL pages with ORIGINAL content? This will overwrite your current edits on Profile, Teaching, Research, etc.")) return;
                const { setDoc, serverTimestamp, getDoc, doc } = await import('firebase/firestore');

                // 1. Profile Content
                const profileContent = `
                   <h2>Academic Background</h2>
                   <hr />
                   <table>
                        <tbody>
                            <tr><td>Degree</td><td>Institute of Study</td><td>Year</td></tr>
                            <tr><td>Ph.D. (Mathematics)</td><td>University of Lucknow</td><td>2013</td></tr>
                            <tr><td>UGC–JRF (NET) Qualified</td><td>UGC</td><td>2007</td></tr>
                            <tr><td>M.Sc.</td><td>University of Lucknow</td><td>2007</td></tr>
                            <tr><td>RBS–M MATE Fellowship</td><td>RBS Foundation</td><td>2006</td></tr>
                            <tr><td>B.Sc.</td><td>University of Lucknow</td><td>2005</td></tr>
                            <tr><td>Intermediate</td><td>U.P. Board</td><td>2002</td></tr>
                            <tr><td>High School</td><td>U.P. Board</td><td>2000</td></tr>
                        </tbody>
                   </table>

                   <h2>Work Experience</h2>
                   <hr />
                   <table style="width: 100%; border-collapse: collapse;">
                        <tbody>
                            <tr><td>Position</td><td>Area</td></tr>
                            <tr><td>Contractual Faculty</td><td>Lucknow University (2007 – 2008)</td></tr>
                            <tr><td>Guest Faculty (Under UGC Norms)</td><td>Lucknow University (2008 – 2011)</td></tr>
                            <tr><td>Senior Research Fellow</td><td>BBD University, Lucknow (2012 – 2014)</td></tr>
                            <tr><td>Assistant Professor</td><td>Rajkiya PG College, Uttarkashi, Uttarakhand (2014 – 2015)</td></tr>
                            <tr><td>Assistant Professor, Dept. of Mathematics and Scientific Computing</td><td>MMMUT, Gorakhpur (2015 – Present)</td></tr>
                            <tr><td>Officer In Charge, Lawn Tennis</td><td>MMMUT, Gorakhpur (2015 – 2017)</td></tr>
                             <tr><td>Member, Library Affairs Committee</td><td>MMMUT, Gorakhpur (2015)</td></tr>
                             <tr><td>Deputy Officer-in-Charge, Timetable</td><td>MMMUT, Gorakhpur (2015 – 2021)</td></tr>
                             <tr><td>Assistant Centre Superintendent (Examinations)</td><td>MMMUT, Gorakhpur (2016)</td></tr>
                             <tr><td>Officer In Charge, Guest House</td><td>MMMUT, Gorakhpur (2017)</td></tr>
                             <tr><td>Joint Controller of Examination</td><td>MMMUT, Gorakhpur (2017)</td></tr>
                             <tr><td>Member, Steering Committee</td><td>MMMUT, Gorakhpur (2017 – 2018)</td></tr>
                             <tr><td>Warden, Tilak Hostel</td><td>MMMUT, Gorakhpur (2017 – 2018)</td></tr>
                             <tr><td>Member, Cultural Society</td><td>MMMUT, Gorakhpur (2017 – 2020)</td></tr>
                             <tr><td>Warden, Sarojini Hostel</td><td>MMMUT, Gorakhpur (2017 – 2020)</td></tr>
                             <tr><td>Member, Women’s Grievance Redressal Cell</td><td>MMMUT, Gorakhpur (2017 – 2021)</td></tr>
                             <tr><td>Member, ITRC Management Committee</td><td>MMMUT, Gorakhpur (2017)</td></tr>
                             <tr><td>Officer In Charge, Horticulture</td><td>MMMUT, Gorakhpur (2020)</td></tr>
                             <tr><td>Member Secretary, Campus Development Cell (CDC)</td><td>MMMUT, Gorakhpur (2020)</td></tr>
                             <tr><td>Officer In Charge, Cultural Sub-Council</td><td>MMMUT, Gorakhpur (2020)</td></tr>
                             <tr><td>Officer In Charge, Badminton</td><td>MMMUT, Gorakhpur (2020)</td></tr>
                             <tr><td>Warden, Tagore Hostel</td><td>MMMUT, Gorakhpur (2020)</td></tr>
                             <tr><td>Member, EDP Cell</td><td>MMMUT, Gorakhpur (2021)</td></tr>
                        </tbody>
                   </table>
                   `;

                // 2. Teaching Content
                const teachingContent = `
                   <h2>Subjects Taught</h2>
                   <hr />
                   <table>
                       <thead><tr><th>Code</th><th>Subject</th></tr></thead>
                       <tbody>
                           <tr><td>BAS 01</td><td>Mathematics-I</td></tr>
                           <tr><td>BAS 07</td><td>Mathematics-II</td></tr>
                           <tr><td>BAS 02</td><td>Mathematics-II</td></tr>
                           <tr><td>BAS 21</td><td>Applied Mathematics</td></tr>
                           <tr><td>MAS 101</td><td>Numerical Methods</td></tr>
                           <tr><td>MAS 211</td><td>Modern Algebra</td></tr>
                           <tr><td>MAS 105</td><td>Linear Algebra</td></tr>
                           <tr><td>BMS 01</td><td>Calculus</td></tr>
                           <tr><td>BMS 02</td><td>Linear Algebra</td></tr>
                       </tbody>
                   </table>
                   `;

                // 3. Research Content
                const researchContent = `
                   <h2>Research Projects</h2>
                   <hr />
                   <table>
                       <tbody>
                           <tr><td colspan="2">Study of Derived Length and Nilpotency Class of Group Algebras</td></tr>
                           <tr><td>Period</td><td>2017 – 2020</td></tr>
                           <tr><td>Funding</td><td>DST (SERB), New Delhi</td></tr>
                           <tr><td>Amount</td><td>Rs. 5.45 Lac</td></tr>
                       </tbody>
                   </table>
                   `;

                // 4. Contact Content
                const contactContent = `
                   <h2>Contact Details</h2>
                   <div style="background-color: white; padding: 20px; border-radius: 12px; margin-top: 20px; border: 1px solid #913c07;">
                       <h3 style="font-size: 1.25rem; font-weight: 600;">Dr. Harish Chandra</h3>
                       <p style="font-size: 0.875rem; margin-bottom: 16px;">Assistant Professor</p>
                       <div style="font-size: 0.875rem; margin-bottom: 24px;">
                           <p>Department of Mathematics and Scientific Computing</p>
                           <p>Madan Mohan Malaviya University of Technology</p>
                           <p>Gorakhpur, Uttar Pradesh – <b>273010</b>, India</p>
                       </div>
                       
                       <div style="margin-bottom: 16px;">
                           <strong>Phone:</strong> <br/>
                           +91-9450565757 <br/>
                           +91-9235501647
                       </div>
                       
                       <div style="margin-bottom: 16px;">
                           <strong>Email:</strong> <br/>
                           Official: <a href="mailto:hcmsc@mmmut.ac.in">hcmsc@mmmut.ac.in</a> <br/>
                           Personal: <a href="mailto:hc19856@gmail.com">hc19856@gmail.com</a>
                       </div>
                       
                       <div>
                           <strong>Location:</strong> <br/>
                           26°43′53.2″N 83°25′59.3″E
                       </div>
                   </div>
                   `;

                // 5. Gallery Content
                const galleryContent = `
                    <h1 style="text-align: center; color: #913c07; font-size: 2rem; font-weight: bold; margin-bottom: 20px;">Gallery</h1>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                       <img src="/1.jpeg" alt="G1" style="width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                       <img src="/2.jpeg" alt="G2" style="width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                       <img src="/3.jpeg" alt="G3" style="width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                       <img src="/4.JPG" alt="G4" style="width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                       <img src="/5.JPG" alt="G5" style="width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                       <img src="/6.jpg" alt="G6" style="width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                       <img src="/7.JPG" alt="G7" style="width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                       <img src="/8.JPG" alt="G8" style="width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                       <img src="/9.JPG" alt="G9" style="width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                       <img src="/10.png" alt="G10" style="width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                       <img src="/11.jpeg" alt="G11" style="width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                       <img src="/12.jpeg" alt="G12" style="width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                       <img src="/13.JPG" alt="G13" style="width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                       <img src="/14.jpeg" alt="G14" style="width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                       <img src="/15.jpeg" alt="G15" style="width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                       <img src="/16.jpeg" alt="G16" style="width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                       <img src="/17.jpg" alt="G17" style="width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                       <img src="/18.jpg" alt="G18" style="width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                    </div>
                `;
                const homeContent = `<p>Dr. Harish Chandra is an accomplished academician serving as an Assistant Professor of Mathematics in the Department of Mathematics and Scientific Computing at Madan Mohan Malaviya University of Technology (MMMUT), Gorakhpur.</p><p>With nearly two decades of experience in teaching, research, and academic administration, he has made significant contributions to higher education. He earned his Ph.D. in Mathematics from the University of Lucknow and is a UGC-NET qualified scholar (JRF & SRF).</p>`;

                const publicationsContent = `<h2>Publications</h2><hr /><table><thead><tr><th>S.No.</th><th>Title</th><th>Year</th><th>Link</th></tr></thead><tbody><tr><td>1</td><td>SmartAgri-IDQ:Quantum-Resistant Identity-Based Data Authentication Protocol for Smart Agriculture Iot</td><td>2026</td><td>-</td></tr><tr><td>2</td><td>ANALYSIS AND PREDICTION OF FUTURE MALARIA AND TYPHOID OUTBREAKS BASED ON TIME-VARYING CONTACT RATES:AN ARIMA APPROACH</td><td>2025</td><td>-</td></tr><tr><td>3</td><td>A Robust Lattice-Based Post-Quantum Three-Party Key Exchange Scheme for Mobile Devices</td><td>2025</td><td><a href="https://onlinelibrary.wiley.com/doi/10.1002/cpe.70036" target="_blank">View</a></td></tr><tr><td>4</td><td>CRYPTOGRAPHY BASED ON SAWI-ELZAKI TRANSFORM</td><td>2025</td><td>-</td></tr><tr><td>5</td><td>Unit group of group algebras of non abelian group of order up to 30</td><td>2025</td><td><a href="https://dx.doi.org/10.5269/bspm.76165" target="_blank">View</a></td></tr><tr><td>6</td><td>LB-RFID: Provably Secure Post-quantum Authentication Protocol for RFID Devices in Resource-constrained IoT Environment</td><td>2025</td><td><a href="https://link.springer.com/article/10.1007/s11277-025-11847-8" target="_blank">View</a></td></tr><tr><td>7</td><td>Optimal control of malaria with medicine and insecticide: A mathematical model</td><td>2025</td><td>-</td></tr><tr><td>8</td><td>Lightweight hybrid lattice-based session key agreement protocol for multimedia IoT</td><td>2025</td><td><a href="https://link.springer.com/article/10.1007/s12243-025-01122-z" target="_blank">View</a></td></tr><tr><td>9</td><td>SIS-Based Signature Schemes and Their Countermeasures: From Vulnerability to Vigilance</td><td>2025</td><td><a href="https://link.springer.com/chapter/10.1007/978-3-031-90587-2_1" target="_blank">View</a></td></tr><tr><td>10</td><td>Lattice-Based Authentication Scheme for Smart Agriculture System</td><td>2025</td><td><a href="https://link.springer.com/chapter/10.1007/978-981-97-8051-8_12" target="_blank">View</a></td></tr><tr><td>11</td><td>A matrix technique-based numerical treatment of a nonlocal singular boundary value problems</td><td>2025</td><td><a href="https://onlinelibrary.wiley.com/doi/10.1002/mma.9809" target="_blank">View</a></td></tr><tr><td>12</td><td>Blockchain based authentication and access control protocol for IoT</td><td>2024</td><td><a href="https://link.springer.com/article/10.1007/s11042-023-17607-9" target="_blank">View</a></td></tr><tr><td>13</td><td>A New Public Key Cryptography Using Generalized Fibonacci Matrices</td><td>2024</td><td>-</td></tr><tr><td>14</td><td>Group Algebras of Lie Nilpotency Index 15</td><td>2024</td><td>-</td></tr><tr><td>15</td><td>Post-quantum attack resilience blockchain-assisted data authentication protocol for smart healthcare system</td><td>2024</td><td><a href="https://onlinelibrary.wiley.com/doi/10.1002/spe.3336" target="_blank">View</a></td></tr><tr><td>16</td><td>Network Malaria Model on Account of Wide Communication</td><td>2024</td><td><a href="https://ieeexplore.ieee.org/document/10923044/" target="_blank">View</a></td></tr><tr><td>17</td><td>An encryption and decryption technique using planar graph with self-invertible matrix</td><td>2024</td><td><a href="https://link.springer.com/article/10.1007/s10586-022-03955-y" target="_blank">View</a></td></tr><tr><td>18</td><td>Quantum-resistant public-key encryption and signature schemes with smaller key sizes</td><td>2024</td><td>-</td></tr><tr><td>19</td><td>Modular group algebra with upper Lie nilpotency index 11p - 9</td><td>2024</td><td><a href="https://as.yazd.ac.ir/article_3140.html" target="_blank">View</a></td></tr><tr><td>20</td><td>On the normal complement problem of finite group algebra</td><td>2023</td><td><a href="https://www.worldscientific.com/doi/10.1142/S1793557123502029" target="_blank">View</a></td></tr><tr><td>21</td><td>On the Unit Group of Certain Finite Group Algebras</td><td>2023</td><td>-</td></tr><tr><td>22</td><td>23rd Solar Cycle: Solar Activity Parameters and Associated Forbush Decreases</td><td>2023</td><td><a href="https://linkinghub.elsevier.com/retrieve/pii/S027311772200984X" target="_blank">View</a></td></tr><tr><td>23</td><td>A new encryption scheme based on Legendre's transform</td><td>2023</td><td>-</td></tr><tr><td>24</td><td>Quantum-defended Digital Signature on Lattice for IoT-enabled Systems</td><td>2023</td><td><a href="https://link.springer.com/chapter/10.1007/978-981-19-9719-8_26" target="_blank">View</a></td></tr><tr><td>25</td><td>Comparison of Solar Activity Parameters and Associated Forbush Decreases in Solar Cycles 23 and 24</td><td>2023</td><td><a href="https://link.springer.com/article/10.1007/s10509-022-04156-0" target="_blank">View</a></td></tr><tr><td>26</td><td>A note on modular group algebras with upper Lie nilpotency indices</td><td>2022</td><td><a href="https://admjournal.luguniv.edu.ua/index.php/adm/article/view/1694" target="_blank">View</a></td></tr><tr><td>27</td><td>A comparison of Solar Cycle 23rd and 24th for Solar type II radio bursts associated with coronal mass ejection in relation to interplanetary features</td><td>2022</td><td><a href="https://link.springer.com/article/10.1007/s10509-022-04156-0" target="_blank">View</a></td></tr><tr><td>28</td><td>Unit Groups of Group Algebras on Certain Quasidihedral Groups</td><td>2022</td><td>-</td></tr><tr><td>29</td><td>The Structure of the Unit Group of a Group Algebra of a Group of Order 37</td><td>2022</td><td>-</td></tr><tr><td>30</td><td>The Group of Units of Group Algebras of Abelian Groups of Order 36 and C3 x A4 over Any Finite Field</td><td>2022</td><td><a href="https://doi.org/10.24330/ieja.1077623" target="_blank">View</a></td></tr><tr><td>31</td><td>Structure of Unit Group of Fpn D6</td><td>2021</td><td><a href="https://doi.org/10.1142/S1793557121500753" target="_blank">View</a></td></tr><tr><td>32</td><td>Unit Groups of Group Algebras of Abelian Groups of Order 32</td><td>2021</td><td><a href="https://doi.org/10.22199/issn.0717-6279-4374" target="_blank">View</a></td></tr><tr><td>33</td><td>Modular Group Algebras with Small Upper Lie Nilpotency Index</td><td>2020</td><td><a href="https://doi.org/10.1166/asem.2020.2517" target="_blank">View</a></td></tr><tr><td>34</td><td>Relationship Between Rising Phase of Solar Cycle 23rd and 24th with Respect to Geoeffectiveness</td><td>2020</td><td><a href="https://doi.org/10.1166/asem.2020.2518" target="_blank">View</a></td></tr><tr><td>35</td><td>Group Algebras of Lie Nilpotency Index 14</td><td>2020</td><td><a href="https://doi.org/10.1142/S1793557120500886" target="_blank">View</a></td></tr><tr><td>36</td><td>IoT based malaria website model using Digital Binary Code: A Mathematical Study, 2024 International Conference on IoT, Communication and Automation Technology (ICICAT), Gorakhpur, India, 2024, pp. 1671-1676, doi: 10.1109/ICICAT62666.2024.10923427</td><td>2025</td><td><a href="https://doi.org/10.1109/ICICAT62666.2024.10923427" target="_blank">View</a></td></tr><tr><td>37</td><td>An efficient and secure undeniable signature scheme based on Ring learning with error, International Journal of Ad Hoc and Ubiquitous Computing (Accepted, SCIE, IF=0.7)</td><td>2025</td><td>-</td></tr><tr><td>38</td><td>Solar flares associated coronal mass ejection accompanied with DH type II radio burst in relation with interplanetary magnetic field, geomagnetic storms and cosmic ray intensity</td><td>2018</td><td><a href="https://doi.org/10.1016/j.newast.2017.10.001" target="_blank">View</a></td></tr><tr><td>39</td><td>Solar flares associated coronal mass ejections causing geo-effectiveness and Forbush decreases</td><td>2017</td><td><a href="https://doi.org/10.1007/s10509-017-3024-0" target="_blank">View</a></td></tr><tr><td>40</td><td>Generalization of Mittag - Leffler Function and It's Properties</td><td>2017</td><td>-</td></tr><tr><td>41</td><td>Solar flares associated coronal mass ejections in case of type II radio bursts</td><td>2016</td><td><a href="https://doi.org/10.1007/s10509-016-2857-2" target="_blank">View</a></td></tr><tr><td>42</td><td>Strongly Lie Nilpotent Group Algebras of Index at Most 8</td><td>2014</td><td><a href="https://doi.org/10.1142/S0219498814500443" target="_blank">View</a></td></tr><tr><td>43</td><td>Units group of semisimple group algebra of groups of order 36, Annales Mathematicae et Informaticae, DOI: 10.33039/ami.2025.10.014 (ESCI, SJR, Scopus)</td><td>2025</td><td><a href="https://ami.uni-eszterhazy.hu" target="_blank">View</a></td></tr><tr><td>44</td><td>On Group Algebras with Unit Groups of Derived Length Three in Characteristic Three</td><td>2013</td><td><a href="https://doi.org/10.5486/PMD.2013.5461" target="_blank">View</a></td></tr><tr><td>45</td><td>Lie Solvable Group Algebras of Derived Length Three in Characteristic Three</td><td>2012</td><td><a href="https://doi.org/10.1142/S0219498812500983" target="_blank">View</a></td></tr><tr><td>46</td><td>Group Algebras with Unit Groups of Derived Length Three</td><td>2010</td><td><a href="https://doi.org/10.1142/S0219498810003938" target="_blank">View</a></td></tr></tbody></table>`;

                const workshopsContent = `<h2>Workshops & Events</h2><hr /><table><thead><tr><th>S.No.</th><th>Title</th><th>Date</th><th>Venue</th><th>Role</th></tr></thead><tbody><tr><td>1</td><td>Mathematical Methods in Science and Technology (STCMMST-15)</td><td>December 15-19, 2015</td><td>MMM University of Technology, Gorakhpur</td><td>Deputy Coordinator</td></tr><tr><td>2</td><td>Recent Trends in Mathematical Sciences (NCRTMS-16)</td><td>April 12-13, 2016</td><td>Department of Applied Science, MMM University of Technology, Gorakhpur</td><td>Organizing Secretary</td></tr><tr><td>3</td><td>Application of Physical Sciences in Engineering and Technology (STCAPSET-16)</td><td>July 2-8, 2016</td><td>Department of Applied Science, MMM University of Technology, Gorakhpur</td><td>Deputy Coordinator</td></tr><tr><td>4</td><td>Emerging trends in material sciences (STCETMS-17)</td><td>March 23-29, 2017</td><td>Department of Applied Science, MMM University of Technology, Gorakhpur</td><td>Deputy Coordinator</td></tr><tr><td>5</td><td>Research Scholar Day (RSD-2017)</td><td>December 12, 2017</td><td>Department of Applied Science, MMMUT Gorakhpur</td><td>Convener</td></tr><tr><td>6</td><td>Recent Advances in Pure and Applied Mathematics</td><td>April 12-13, 2018</td><td>Department of Applied Science, MMM University of Technology, Gorakhpur</td><td>Convener</td></tr><tr><td>7</td><td>Research Scholar Day (RSD-2018)</td><td>December 17, 2018</td><td>Department of Applied Science, MMMUT Gorakhpur</td><td>Convener</td></tr><tr><td>8</td><td>Smart Material, Devices and Sustainable Technologies (SMDST-19)</td><td>March 15-16, 2019</td><td>Department of Applied Science, MMM University of Technology, Gorakhpur</td><td>Organizing Secretary</td></tr><tr><td>9</td><td>Recent Advances in Mathematics and Scientific Computing (RAMSC-19)</td><td>April 5-6, 2019</td><td>Department of Applied Science, MMM University of Technology, Gorakhpur</td><td>Coordinator</td></tr><tr><td>10</td><td>Mathematical modelling and spread of COVID 19</td><td>May 16, 2020</td><td>Department of Mathematics and Scientific Computing, MMM University of Technology, Gorakhpur</td><td>Coordinator (Webinar)</td></tr><tr><td>11</td><td>Mathematical Tools and Recent Advances in Mathematics (MTAM-2020)</td><td>September 21-25, 2020</td><td>Department of Mathematics and Scientific Computing, MMM University of Technology, Gorakhpur</td><td>Organizing Secretary</td></tr><tr><td>12</td><td>Mathematical Tools and Recent Advances in Applied Mathematics (MTRAAM-2021) - Sponsored by AICTE ATAL</td><td>August 16-20, 2021</td><td>Department of Mathematics and Scientific Computing, MMM University of Technology, Gorakhpur</td><td>Coordinator</td></tr><tr><td>13</td><td>4th International Conference on Frontiers in Industrial and Applied Mathematics (FIAM-2021)</td><td>December 21-22, 2021</td><td>Department of Mathematics SLIET, Longowal</td><td>Session Chair</td></tr><tr><td>14</td><td>Recent Advances in Applied Mathematics using Mathematical Tools (RAAMMT-2022)</td><td>December 14-18, 2022</td><td>Department of Mathematics and Scientific Computing MMMUT, Gorakhpur</td><td>Convener</td></tr><tr><td>15</td><td>Research Scholar Day</td><td>March 14, 2024</td><td>Department of Mathematics and Scientific Computing, MMM University of Technology, Gorakhpur</td><td>Convener</td></tr><tr><td>16</td><td>Bhartiya Gyan Parampara ka Vikshit Bharat Mein Yogdan</td><td>October 13, 2024</td><td>MMM University of Technology and Bhartiya Shikshan Mandal Goraksha Prant</td><td>Organizing Secretary</td></tr><tr><td>17</td><td>National Workshop on LaTeX and PSTricks</td><td>November 22-26, 2010</td><td>Bhaskaracharya Pratishthana, Pune</td><td>Attended</td></tr><tr><td>18</td><td>National Workshop on Computer Algebra system (CAS)</td><td>January 27-31, 2011</td><td>Bhaskaracharya Pratishthana, Pune</td><td>Attended</td></tr><tr><td>19</td><td>National Workshop on LaTeX and Scilab</td><td>November 22-26, 2011</td><td>Department of Mathematics and Astronomy, University of Lucknow</td><td>Attended & Presented Paper</td></tr><tr><td>20</td><td>TEQIP-II Basic pedagogy training on objective and outcome based education system</td><td>June 12-16, 2015</td><td>MMM University of Technology, Gorakhpur</td><td>Attended</td></tr><tr><td>21</td><td>National Workshop on LaTeX and Allied topics</td><td>October 27 - November 2, 2015</td><td>Academic Staff College, University of Lucknow</td><td>Attended</td></tr><tr><td>22</td><td>Faculty Development for Improved Competencies on Entrepreneurship</td><td>February 12-16, 2016</td><td>M.M.M. University of Technology, Gorakhpur</td><td>Attended</td></tr><tr><td>23</td><td>28 days orientation programme</td><td>May 20 - June 16, 2017</td><td>Academic staff College, DDU University, Gorakhpur</td><td>Attended</td></tr><tr><td>24</td><td>Short Term Course on Research Methodology and Statistics</td><td>October 24-30, 2018</td><td>Department of Applied Science, MMM University of Technology, Gorakhpur</td><td>Attended</td></tr><tr><td>25</td><td>National Workshop on LaTeX and Its Applications</td><td>March 11-15, 2019</td><td>Department of Computer Science and Engineering, MMM University of Technology, Gorakhpur</td><td>Attended</td></tr><tr><td>26</td><td>ICT in Advance Teaching and Learning for Academicians: A Gateway to Excellence</td><td>October 14-18, 2019</td><td>Electronics and ICT Academy, NIT Patna and Department of Humanities and Management Science, MMMUT Gorakhpur</td><td>Attended</td></tr><tr><td>27</td><td>Data Analytics and IOT</td><td>November 4-8, 2019</td><td>Department of Computer Science and Engineering, MMMUT Gorakhpur</td><td>Attended</td></tr><tr><td>28</td><td>Introduction to Abstract and Linear Algebra (NPTEL)</td><td>July - November 2019</td><td>8 week AICTE approved FDP through NPTEL</td><td>Completed</td></tr><tr><td>29</td><td>Modern Algebra (NPTEL)</td><td>July - November 2019</td><td>8 week AICTE approved FDP through NPTEL</td><td>Completed</td></tr><tr><td>30</td><td>Research Methods and Data Analysis Using SPSS & AMOS</td><td>January 27-31, 2020</td><td>Department of Humanities and Management Science, MMMUT Gorakhpur</td><td>Attended</td></tr><tr><td>31</td><td>Mathematical Methods and its Applications (NPTEL)</td><td>January - April 2020</td><td>12 week AICTE approved FDP through NPTEL</td><td>Passed</td></tr><tr><td>32</td><td>Transform Calculus and its applications in Differential Equations (NPTEL)</td><td>January - April 2020</td><td>12 week AICTE approved FDP through NPTEL</td><td>Passed</td></tr><tr><td>33</td><td>Curriculum design, Delivery and Assessment for Outcome based Education</td><td>May 11-16, 2020</td><td>Internal Quality Assurance Cell (IQAC), M.M.M. University of Technology, Gorakhpur</td><td>Attended</td></tr><tr><td>34</td><td>Nascent Research Methods, Challenges and various Analytical Tools and Techniques</td><td>June 24-29, 2020</td><td>Department of Humanities and Management Science, MMMUT, Gorakhpur (TEQIP III with SVNIT Surat)</td><td>Attended</td></tr><tr><td>35</td><td>Advanced Concepts for Developing MOOCS</td><td>July 2-17, 2020</td><td>Teaching Learning Centre Ramanujan College, University of Delhi with MHRD</td><td>Attended</td></tr><tr><td>36</td><td>ARPIT course for CAS promotion on Pedagogical Innovations and Research Methodology</td><td>December 1, 2020 - March 31, 2021</td><td>16-week course through Swayam</td><td>Passed</td></tr><tr><td>37</td><td>Online refresher course in Mathematics</td><td>March 16-30, 2021</td><td>Department of Mathematics, Ramanujan College</td><td>Attended</td></tr><tr><td>38</td><td>Examination Reform</td><td>March 26-30, 2022</td><td>AICTE, New Delhi and Madan Mohan Malaviya University of Technology, Gorakhpur</td><td>Attended</td></tr><tr><td>39</td><td>Online refresher course in Mathematics</td><td>November 2-15, 2022</td><td>UGC-HRDC, University of Allahabad</td><td>Attended (Grade A)</td></tr><tr><td>40</td><td>Advance Statistical Data Analysis using SPSS</td><td>January 21-27, 2023</td><td>Uttar Pradesh Medical University and Science Tech Institute, Lucknow</td><td>Attended</td></tr><tr><td>41</td><td>Outcome Based Education and Application of Generative AI in Teaching and Research</td><td>April 17-24, 2024</td><td>IQAC of Gauhati University with ipsr solutions limited</td><td>Attended (Grade A)</td></tr><tr><td>42</td><td>Research Methodology</td><td>March 17-22, 2025</td><td>UGC-MMTTC with Department of Statistics, Patna University, Patna</td><td>Attended (Grade A)</td></tr></tbody></table>`;

                const paperPresentationContent = `<h2>Paper Presentations</h2><hr /><table><thead><tr><th>S.No.</th><th>Title</th><th>Date</th><th>Venue</th><th>Status</th></tr></thead><tbody><tr><td>1</td><td>The History of Algebraic Geometry</td><td>January 15-16, 2008</td><td>3rd National Symposium in Modern Trends in Differential Geometry and Mathematical Modelling in Bio-Sciences, Department of Mathematics and Astronomy, University of Lucknow</td><td>Presented</td></tr><tr><td>2</td><td>The Study of Derived Length and Nilpotency of Group Algebras</td><td>December 22-23, 2008</td><td>National Conference on Mathematics, Department of Mathematics and Astronomy, University of Lucknow</td><td>Presented</td></tr><tr><td>3</td><td>LaTeX and its Application</td><td>November 22-26, 2011</td><td>Workshop on LaTeX and SciLab, Department of Mathematics and Astronomy, University of Lucknow</td><td>Presented</td></tr><tr><td>4</td><td>Group algebras with unit groups of derived length three</td><td>February 2-4, 2012</td><td>National Conference on Recent Advances in Mathematics NCRAM-2012, University of Lucknow</td><td>Presented</td></tr><tr><td>5</td><td>A note on unit group algebras of derived length three in characteristic three</td><td>March 24, 2013</td><td>National Conference on Mathematics, Lucknow University</td><td>Presented</td></tr><tr><td>6</td><td>Strongly Lie nilpotent group algebras of class at most</td><td>August 24, 2013</td><td>Seminar on the frontier area of Mathematics, Lucknow University</td><td>Presented</td></tr><tr><td>7</td><td>Study of Unit Group Algebras of Derived Length 3</td><td>July 10-12, 2015</td><td>International conference in recent trends in Mathematics, University of Allahabad</td><td>Presented</td></tr><tr><td>8</td><td>Study of the derived length of group algebras</td><td>November 1, 2015</td><td>One-day symposium on LaTeX and Allied Topics, HRD Center Lucknow University</td><td>Presented</td></tr><tr><td>9</td><td>Recent results related to the derived length of unit group algebras</td><td>November 18-19, 2017</td><td>National Conference on Mathematical Analysis and Applications, Department of Mathematics and Astronomy, Lucknow University</td><td>Presented</td></tr><tr><td>10</td><td>Lie Nilpotent Group Algebras of index 14</td><td>April 13-15, 2018</td><td>International Conference on Emerging Trends in Physical Sciences, Department of Mathematics, RML Awadh University, Faizabad</td><td>Presented</td></tr><tr><td>11</td><td>Recent Results in Nilpotent Group Algebras</td><td>August 9-11, 2018</td><td>International Conference on Algebra and Applied Analysis (ICAAA-2018), Integral University, Lucknow</td><td>Presented</td></tr><tr><td>12</td><td>A Note on Group Algebras of small Nilpotency Indices</td><td>November 10-11, 2018</td><td>National Conference on Recent Trends in Mathematics, Department of Mathematics and Astronomy, Lucknow University</td><td>Presented</td></tr><tr><td>13</td><td>A Note on the derived length of solvable group Algebras</td><td>November 23-25, 2018</td><td>International Conference on Algebra and Continuum Mechanics, Department of Mathematics and Statistics, Himachal Pradesh University, Shimla</td><td>Presented</td></tr><tr><td>14</td><td>Unit groups of group algebras of Abelian Groups of small order</td><td>October 8-12, 2021</td><td>Second International Workshop on Advanced Topics in Mathematics-2021, Centre for Applied Mathematics, International Institute of Information Technology Naya Raipur</td><td>Presented</td></tr><tr><td>15</td><td>Groups of Units of Certain Finite Group Algebras</td><td>December 21-22, 2021</td><td>4th International Conference on Frontiers in Industrial and Applied Mathematics (FIAM-2021), Department of Mathematics SLIET, Longowal</td><td>Presented</td></tr><tr><td>16</td><td>On the unit group of certain finite group algebras</td><td>July 19-21, 2022</td><td>SXC Centenary Year- International Conference on Recent Developments in Pure and Applied Mathematics, PG and Research Department of Mathematics, St. Xavier's College, Palayamkottai, Tirunelveli</td><td>Presented</td></tr><tr><td>17</td><td>AN EFFICIENT UNDENIABLE SIGNATURE SCHEME BASED ON RING LEARNING WITH ERROR</td><td>February 27-28, 2024</td><td>International Conference on Recent Trends in Data Science (ICRTDS@2024), Department of Data Science and Mathematics, St. Xavier's College (Autonomous), Palayamkottai, Tamilnadu</td><td>Presented</td></tr><tr><td>18</td><td>Cryptography Based oN Elzaki-Sawi Transform</td><td>October 25-26, 2024</td><td>International Conference on Applications of Mathematics in Data Science (ICAMD 2024), Department of Data Science, St. Xavier's College (Autonomous), Palayamkottai, Tamilnadu</td><td>Presented</td></tr><tr><td>19</td><td>A LIGHTWEIGHT IDENTITY-BASED ENCRYPTION WITH EQUALITY TEST FOR CLOUD SERVICE</td><td>October 25-26, 2024</td><td>International Conference on Recent Trends in Data Science (ICRTDS 2024), Department of Data Science, St. Xavier's College (Autonomous), Palayamkottai, Tamilnadu</td><td>Presented</td></tr><tr><td>20</td><td>On the structure of unit groups of the group algebra of non-abelian groups of order 36</td><td>November 20-22, 2024</td><td>2nd International Conference on Evolution in Pure & Applied Mathematics (ICEPAM-2024), Department of Mathematics, Akal University, Talwandi Sabo, Bathinda, Punjab</td><td>Presented</td></tr><tr><td>21</td><td>An Efficient ECC-Based Key Exchange Protocol for Secure Multi-User Communication (by Sakshi Pathak, Harish Chandra, and Lacchita Soni)</td><td>May 10-11, 2025</td><td>3rd International Conference on Recent Trends in Mathematical Sciences (ICRTMS-2025), Himachal Ganita Parishad (HGP), Himachal Pradesh University, Shimla</td><td>Presented</td></tr><tr><td>22</td><td>ON THE STRUCTURE OF UNIT GROUP OF SOME FINITE GROUP ALGEBRA AND THEIR NORMAL COMPLEMENT (by Kshama Yadav, Harish Chandra, and Diksha Upadhyay)</td><td>May 10-11, 2025</td><td>3rd International Conference on Recent Trends in Mathematical Sciences (ICRTMS-2025), Himachal Ganita Parishad (HGP), Himachal Pradesh University, Shimla</td><td>Presented</td></tr><tr><td>23</td><td>Public Key Encryption and Signature Schemes with Smaller Key Size</td><td>December 26-29, 2025</td><td>91st Annual Conference of the Indian Mathematical Society - An International Meet, University of Lucknow</td><td>Presented</td></tr></tbody></table>`;

                const participationContent = `<h2>Miscellaneous Participation</h2><hr /><table><thead><tr><th>S.No.</th><th>Event</th><th>Date</th><th>Venue</th><th>Role</th></tr></thead><tbody><tr><td>1</td><td>2nd National Symposium on Modern Trends in Differential Geometry and Mathematical modelling</td><td>January 9-10, 2010</td><td>Department of Mathematics and Astronomy, Lucknow University, Lucknow</td><td>Participant</td></tr><tr><td>2</td><td>3rd National symposium on Modern Trends in Differential Geometry and Mathematical modelling</td><td>January 5-16, 2011</td><td>Department of Mathematics and Astronomy, Lucknow University, Lucknow</td><td>Participant</td></tr><tr><td>3</td><td>National symposium on Application of various Techniques in Fluid Dynamics</td><td>February 10-12, 2011</td><td>Deptt. of Mathematics, B.S.N.V. Post Graduate College, Lucknow</td><td>Participant</td></tr><tr><td>4</td><td>International Conference on Group Theory and Lie Theory (GT & Lt-2012)</td><td>March 19-21, 2012</td><td>Harish Chandra Research Institute (HRI), Jhusi, Allahabad</td><td>Participant</td></tr><tr><td>5</td><td>State-level faculty interaction seminar</td><td>June 8-9, 2015</td><td>HBTI, Kanpur</td><td>Participant</td></tr><tr><td>6</td><td>Three-day workshop on Energy Efficiency workshop on oil conservation</td><td>August 22-24, 2015</td><td>Petroleum Conservation Research Association, Ministry of Petroleum and Natural Gas, Government of India, M.M.M. University of Technology, Gorakhpur</td><td>Participant</td></tr><tr><td>7</td><td>One day workshop on Green Energy for Sustainable Development: Role of Educational Institutions</td><td>January 21, 2016</td><td>MMMUT, Gorakhpur</td><td>Participant</td></tr><tr><td>8</td><td>Three-day workshop on Hands-on Training Cum Workshop on Soft Computing Skill for Scientist and Engineer</td><td>March 17-19, 2017</td><td>Department of Applied Science, MMMUT Gorakhpur</td><td>Participant</td></tr><tr><td>9</td><td>1st Malaviya Research Conclave (MRC-2017)</td><td>2017</td><td>MMMUT, Gorakhpur</td><td>Participant</td></tr><tr><td>10</td><td>Two-day workshop on Cyber Security and its Relevance in Digital India</td><td>September 7-8, 2018</td><td>Department of Computer Science, MMM University of Technology, Gorakhpur</td><td>Participant</td></tr></tbody></table>`;

                const talksContent = `
                    <h2>Talks Delivered</h2><hr />
                    <table><thead><tr><th>S.No.</th><th>Title</th><th>Date</th><th>Venue</th><th>Audience</th></tr></thead>
                    <tbody>
                        <tr><td>1</td><td>A study of Lie solvable group algebras of derived length three</td><td>August 18-19, 2012</td><td>National Conference on Algebra Analysis and Their Applications, Gov. MAM College Jammu</td><td>Conference Participants</td></tr>
                        <tr><td>2</td><td>Invited talk on LaTeX</td><td>February 28, 2014</td><td>Refresher Course in Math's, Statistics, Computer Science & Astronomy (February 14 – March 07, 2014), HRD Center Lucknow University, Lucknow</td><td>Refresher Course Participants</td></tr>
                        <tr><td>3</td><td>Invited Talk on LaTeX</td><td>March 3, 2014</td><td>Refresher Course in Math's, Statistics, Computer Science & Astronomy (February 14 – March 07, 2014), HRD Center Lucknow University, Lucknow</td><td>Refresher Course Participants</td></tr>
                        <tr><td>4</td><td>Study of Nilpotency class of group Algebras</td><td>February 18-19, 2016</td><td>National Conference on Topological Algebra & Analysis, Deptt. of Mathematics, Gov. Gandhi Memorial Science College Jammu</td><td>Conference Participants</td></tr>
                        <tr><td>5</td><td>LaTeX and Type setting</td><td>October 24-30, 2018</td><td>One-week Short Term Course on Research Methodology and Statistics, Department of Applied Science, MMM University of Technology, Gorakhpur</td><td>Faculty & Researchers</td></tr>
                        <tr><td>6</td><td>LaTeX Typesetting</td><td>January 14, 2019</td><td>Refresher Course on Maths, Statistics, Computer Science & Astronomy (January 2 – January 23, 2019), HRD Center Lucknow University, Lucknow</td><td>Refresher Course Participants</td></tr>
                        <tr><td>7</td><td>Presentation with LaTeX</td><td>January 22, 2019</td><td>Refresher Course on Maths, Statistics, Computer Science & Astronomy (January 2 – January 23, 2019), HRD Center Lucknow University, Lucknow</td><td>Refresher Course Participants</td></tr>
                        <tr><td>8</td><td>Modular Group Algebras with Lie Nilpotency Indices</td><td>February 21-22, 2019</td><td>National conference on Recent Trends in Mathematics and Applications, Faculty of Mathematical and Statistical Sciences, SRMU, Lucknow</td><td>Conference Participants</td></tr>
                        <tr><td>9</td><td>Linear Algebra and Matrix Theory</td><td>September 30, 2019</td><td>DVNPG College, Gorakhpur</td><td>Students & Faculty</td></tr>
                        <tr><td>10</td><td>A note on the structure of unit groups of certain group algebras</td><td>January 30-31, 2020</td><td>2nd National conference on Recent Trends in Mathematics and Applications, Faculty of Mathematical and Statistical Sciences, SRMU, Lucknow</td><td>Conference Participants</td></tr>
                        <tr><td>11</td><td>Typesetting with LaTeX</td><td>February 29, 2020</td><td>Refresher Course on Mathematics, Statistics, Computer Science & Astronomy (MD) (February 17 – February 29, 2020), HRD Center Lucknow University, Lucknow</td><td>Refresher Course Participants</td></tr>
                        <tr><td>12</td><td>LaTeX: A Document Preparation and Typesetting System</td><td>November 25, 2020</td><td>Guru Dakshta (Faculty Induction Programme), HRD Center Lucknow University, Lucknow</td><td>New Faculty Members</td></tr>
                        <tr><td>13</td><td>An Introduction to SciLab</td><td>July 8, 2021</td><td>Seven Days Online Workshop on Research Methodology in Mathematical Sciences (July 4-10, 2021), Department of Mathematics and Statistics, DDU Gorakhpur University</td><td>Workshop Participants (Online)</td></tr>
                        <tr><td>14</td><td>Documentation with LaTeX</td><td>August 16-20, 2021</td><td>One-week online Faculty development programme on Mathematical Tools and Recent Advances in Applied Mathematics (MTRAAM-2021), Department of Mathematics and Scientific Computing, MMM University of Technology, Gorakhpur</td><td>Faculty Members (Online)</td></tr>
                        <tr><td>15</td><td>LaTeX: Scientific Document Preparation System</td><td>March 27, 2022</td><td>One week workshop on Scientific Computing in Mathematical Sciences (March 23-28, 2022), Department of Mathematics and Statistics, DDU Gorakhpur University, Gorakhpur, UP INDIA</td><td>Workshop Participants</td></tr>
                        <tr><td>16</td><td>LaTeX: Scientific Document Preparation System</td><td>March 27, 2022</td><td>One week workshop on Scientific Computing in Mathematical Sciences (March 23-28, 2022), Department of Mathematics and Statistics, DDU Gorakhpur University, Gorakhpur, UP INDIA</td><td>Workshop Participants</td></tr>
                        <tr><td>17</td><td>Scientific Typesetting</td><td>December 8, 2022</td><td>One week ACITE-MMMUT MoU Activities Faculty Development Programme on Modern Research Methods and Analytical Tools (MRMAT-2022) (December 05-09, 2022), Department of Humanities and Management Science, MMMUT, Gorakhpur</td><td>Faculty Members</td></tr>
                        <tr><td>18</td><td>Creating a Presentation with LaTeX</td><td>December 14, 2022</td><td>One week ACITE-MMMUT MoU Activities Faculty Development Programme on Recent Advances in Applied Mathematics using Mathematical Tools (RAAMMT-2022) (December 14-18, 2022), Department of Mathematics and Scientific Computing, MMMUT, Gorakhpur</td><td>Faculty Members</td></tr>
                        <tr><td>19</td><td>Turnitin's Software for new faculty members</td><td>April 22, 2025</td><td>Two weeks Faculty Induction Programme (April 7-27, 2025), Madan Mohan Malaviya University of Technology, Gorakhpur, UP, India</td><td>New Faculty Members</td></tr>
                        <tr><td>20</td><td>Security protocol for new faculty members</td><td>April 17, 2025</td><td>Two weeks Faculty Induction Programme (April 7-27, 2025), Madan Mohan Malaviya University of Technology, Gorakhpur, UP, India</td><td>New Faculty Members</td></tr>
                    </tbody></table>
                `;

                const achievementsContent = `
                    <h2>Scholarships & Fellowships</h2><hr />
                    <table><thead><tr><th>Period</th><th>Title</th><th>Organization</th></tr></thead>
                    <tbody>
                        <tr><td>2010 – 2012</td><td>Senior Research Fellow</td><td>University Grant Commission (UGC), India</td></tr>
                        <tr><td>2008 – 2010</td><td>Junior Research Fellow</td><td>University Grant Commission (UGC), India</td></tr>
                        <tr><td>2006 – 2007</td><td>RBS M Mate Fellow</td><td>Lucknow University</td></tr>
                    </tbody></table>
                    <h2 style="margin-top: 40px;">Qualifications</h2><hr />
                    <table><thead><tr><th>Year</th><th>Qualification</th><th>Organization</th></tr></thead>
                    <tbody>
                        <tr><td>2007</td><td>NET (JRF) – Mathematics</td><td>University Grant Commission (UGC), India</td></tr>
                    </tbody></table>
                    <h2 style="margin-top: 40px;">MOOC / AICTE Certifications</h2><hr />
                    <table><thead><tr><th>Year</th><th>Course Title</th><th>Details</th></tr></thead>
                    <tbody>
                        <tr><td>2020</td><td>Mathematical Methods and its Application</td><td>12-week AICTE approved online course with Elite Certificate (SWAYAM)</td></tr>
                        <tr><td>2019</td><td>Introduction to Abstract and Linear Algebra</td><td>8-week AICTE approved online course with Elite Certificate (SWAYAM)</td></tr>
                        <tr><td>2019</td><td>Modern Algebra</td><td>8-week AICTE approved online course with Elite Certificate (SWAYAM)</td></tr>
                    </tbody></table>
                `;

                const softwareContent = `
                    <h2>Softwares</h2><hr />
                    <table><thead><tr><th>S.No.</th><th>Software & Description</th><th>Action</th></tr></thead>
                    <tbody>
                        <tr><td>1.</td><td><strong>Sage</strong><p>Sage is a free open-source mathematics software system licensed under the GPL. It combines the power of many existing open-source packages into a common Python-based interface. It is a free open source alternative to Magma, Maple, Mathematica and Matlab.</p></td><td><a href="http://www.sagemath.org/" target="_blank">Visit Site</a></td></tr>
                        <tr><td>2.</td><td><strong>Texmaker</strong><p>Texmaker is a free, modern and cross-platform LaTeX editor for linux, macosx and windows systems that integrates many tools needed to develop documents with LaTeX, in just one application. Texmaker includes unicode support, spell checking, auto-completion, code folding and a built-in pdf viewer with synctex support and continuous view mode. Texmaker is released under the GPL license.</p></td><td><a href="http://www.xm1math.net/texmaker/" target="_blank">Visit Site</a></td></tr>
                        <tr><td>3.</td><td><strong>Other Resources</strong><p>Other important free open source software can be downloaded through the following sites:</p><ul><li><a href="http://www.damicon.com/resources/opensoftware.html" target="_blank">Damicon Resources</a></li><li><a href="http://www.tripwiremagazine.com/2010/03/20-most-popular-open-source-software-ever-2.html" target="_blank">Tripwire Magazine List</a></li></ul></td><td>-</td></tr>
                    </tbody></table>
                `;



                const defaults = [
                  { id: 'home', slug: 'home', title: 'Dr. Harish <br /> <span class="text-[#913c07]">Chandra</span>', content: homeContent, blocks: [{ id: "b1", type: "image", url: "/13.JPG" }], status: 'published' },
                  { id: 'profile', slug: 'profile', title: 'Profile', content: profileContent, blocks: [], status: 'published' },
                  { id: 'teaching', slug: 'teaching', title: 'Teaching', content: teachingContent, blocks: [], status: 'published' },
                  { id: 'research', slug: 'research', title: 'Research', content: researchContent, blocks: [], status: 'published' },
                  { id: 'assignments', slug: 'assignments', title: 'Assignments', content: '<h2>Assignments</h2><hr /><p>Following are the assignments of Mathematics for B. Tech. I and M. Tech I</p><a href="https://drive.google.com/drive/u/0/folders/0B7Lzs_siOkGZRkNiOFFZTWJxalU" target="_blank" rel="noopener noreferrer" class="cms-button">View Assignments on Google Drive</a>', blocks: [], status: 'published' },
                  { id: 'class-calendar', slug: 'class-calendar', title: 'Class Calendar', content: '<h2>Class Schedule & Events</h2><hr /><p>Access the complete class calendar, schedules, and important dates</p><a href="https://drive.google.com/drive/u/0/folders/0B7Lzs_siOkGZSGRaZ2IwSTgtZWc" target="_blank" rel="noopener noreferrer" class="cms-button">View Class Calendar on Google Drive</a>', blocks: [], status: 'published' },
                  {
                    id: 'resources', slug: 'resources', title: 'Resources', content: `
                    <h2>RESOURCES</h2><hr />
                    <h3>Websites</h3>
                    <p><a href="https://crazyproject.wordpress.com/" target="_blank">crazyproject.wordpress.com/</a><br/>
                    <i>Very useful site. It contains the solution of the famous book Dummit and Foote</i></p>
                    <h3 style="margin-top: 30px;">Helpful Downloads</h3>
                    <p>Below you will find links to download free helpful software for your home computer:</p>
                    <table><thead><tr><th>Software</th><th>Purpose</th><th>Link</th></tr></thead>
                    <tbody>
                        <tr><td>Adobe Reader X</td><td>Allows you to open and view .pdf files.</td><td><a href="https://get.adobe.com/reader/" target="_blank">Download</a></td></tr>
                        <tr><td>Adobe Flash Player</td><td>Allows you to view flash animations, videos, and play flash games.</td><td><a href="https://www.adobe.com/products/flashplayer/end-of-life.html" target="_blank">Download</a></td></tr>
                        <tr><td>Microsoft PowerPoint viewer</td><td>Allows you to open and view slide shows created with Power Point.</td><td><a href="https://www.microsoft.com/en-us/microsoft-365/free-office-online-for-the-web" target="_blank">Download</a></td></tr>
                        <tr><td>Microsoft Word viewer</td><td>Allows you to open, copy, view, and print documents created with Word.</td><td><a href="https://www.microsoft.com/en-us/microsoft-365/free-office-online-for-the-web" target="_blank">Download</a></td></tr>
                        <tr><td>Java</td><td>Java software allows your computer to run online games and applications.</td><td><a href="https://www.java.com/download/" target="_blank">Download</a></td></tr>
                    </tbody></table>
                  `, blocks: [], status: 'published'
                  },
                  {
                    id: 'web-links', slug: 'web-links', title: 'Web Links', content: `
                    <h2>Web Links</h2><hr />
                    <table><thead><tr><th>Name</th><th>Link</th><th>Notes</th></tr></thead>
                    <tbody>
                        <tr><td>SageMath</td><td><a href="http://www.sagemath.org/" target="_blank">http://www.sagemath.org/</a></td><td>-</td></tr>
                        <tr><td>Texmaker</td><td><a href="http://www.xm1math.net/texmaker/" target="_blank">http://www.xm1math.net/texmaker/</a></td><td>-</td></tr>
                        <tr><td>Damicon Open Software Resources</td><td><a href="http://www.damicon.com/resources/opensoftware.html" target="_blank">http://www.damicon.com/resources/opensoftware.html</a></td><td>-</td></tr>
                        <tr><td>Popular Open Source Software (Tripwire Magazine)</td><td><a href="http://www.tripwiremagazine.com/2010/03/20-most-popular-open-source-software-ever-2.html" target="_blank">http://www.tripwiremagazine.com/2010/03/20-most-popular-open-source-software-ever-2.html</a></td><td>-</td></tr>
                        <tr><td>crazyproject.wordpress.com</td><td><a href="https://crazyproject.wordpress.com/" target="_blank">https://crazyproject.wordpress.com/</a></td><td>Very useful site—it contains solutions to Dummit and Foote</td></tr>
                        <tr><td>Bookfi</td><td><a href="http://en.bookfi.org/" target="_blank">http://en.bookfi.org/</a></td><td>-</td></tr>
                        <tr><td>Bookboon</td><td><a href="http://www.bookboon.com/" target="_blank">http://www.bookboon.com/</a></td><td>-</td></tr>
                        <tr><td>GetFreeEbooks</td><td><a href="http://www.getfreeebooks.com/" target="_blank">http://www.getfreeebooks.com/</a></td><td>-</td></tr>
                        <tr><td>OnlineFreeEbooks</td><td><a href="http://www.onlinefreeebooks.net/" target="_blank">http://www.onlinefreeebooks.net/</a></td><td>-</td></tr>
                        <tr><td>FreeBookSpot</td><td><a href="http://www.freebookspot.es/" target="_blank">http://www.freebookspot.es/</a></td><td>-</td></tr>
                    </tbody></table>
                  `, blocks: [], status: 'published'
                  },
                  { id: 'publications', slug: 'publications', title: 'Publications', content: publicationsContent, blocks: [], status: 'published' },
                  { id: 'workshops', slug: 'workshops', title: 'Workshops', content: workshopsContent, blocks: [], status: 'published' },
                  { id: 'paper-presentation', slug: 'paper-presentation', title: 'Paper Presentations', content: paperPresentationContent, blocks: [], status: 'published' },
                  { id: 'participation', slug: 'participation', title: 'Miscellaneous Participation', content: participationContent, blocks: [], status: 'published' },
                  { id: 'talks', slug: 'talks', title: 'Talks Delivered', content: talksContent, blocks: [], status: 'published' },
                  {
                    id: 'extra-academic-activity', slug: 'extra-academic-activity', title: 'Extra Academic Activity', content: `
                    <h2>Extra Academic Activities</h2><hr />
                    <table><thead><tr><th>S.No.</th><th>Achievement</th><th>Event</th><th>Year</th><th>Position</th></tr></thead>
                    <tbody>
                        <tr><td>1</td><td>Winning Member of Cricket team of VC XI Vs Student XI</td><td>Cricket Match</td><td>2016</td><td>Winner</td></tr>
                        <tr><td>2</td><td>400m faculty race</td><td>Annual Sports MMMUT</td><td>2017</td><td>Winner</td></tr>
                        <tr><td>3</td><td>Tug of war team of Faculty Vs Student</td><td>Annual Sports MMMUT</td><td>2017</td><td>Winner</td></tr>
                        <tr><td>4</td><td>Yoga practice on the occasion of International Yoga Day</td><td>International Yoga Day</td><td>June 21, 2017</td><td>Second</td></tr>
                        <tr><td>5</td><td>Faculty 200m Race</td><td>Annual Sports meet, MMMUT</td><td>2018</td><td>Second</td></tr>
                        <tr><td>6</td><td>Faculty 100m Race</td><td>Annual Sports meet, MMMUT</td><td>2018</td><td>Third</td></tr>
                        <tr><td>7</td><td>Tug of war team of Faculty Vs Student</td><td>Annual Sports MMMUT</td><td>2018</td><td>Winner</td></tr>
                        <tr><td>8</td><td>Faculty 400m Race</td><td>Annual Sports meet, MMMUT</td><td>2019</td><td>First</td></tr>
                        <tr><td>9</td><td>Faculty 200m Race</td><td>Annual Sports meet, MMMUT</td><td>2019</td><td>Third</td></tr>
                        <tr><td>10</td><td>Tug of War Team of Faculty vs Faculty</td><td>Annual Sports meet, MMMUT</td><td>2019</td><td>Runner Up</td></tr>
                        <tr><td>11</td><td>200m faculty race</td><td>Annual Sports Meet AYAAS-2020, MMMUT</td><td>2020</td><td>Winner</td></tr>
                        <tr><td>12</td><td>400m faculty race</td><td>Annual Sports Meet AYAAS-2020, MMMUT</td><td>2020</td><td>Winner</td></tr>
                        <tr><td>13</td><td>Tug of War Team of Faculty</td><td>AYAS-2020 MMMUT</td><td>2020</td><td>Winner</td></tr>
                        <tr><td>14</td><td>Faculty 100m Race</td><td>Annual Sports Meet (AYAAS-2025), MMMUT</td><td>2025</td><td>Third</td></tr>
                        <tr><td>15</td><td>Tug of War Team of Faculty vs Staff</td><td>Annual Sports Meet (AYAAS-2025), MMMUT</td><td>2025</td><td>Runner Up</td></tr>
                    </tbody></table>
                  `, blocks: [], status: 'published'
                  },
                  { id: 'achievements', slug: 'achievements', title: 'Achievements', content: achievementsContent, blocks: [], status: 'published' },
                  {
                    id: 'awarded', slug: 'awarded', title: 'Awarded', content: `
                    <h2>Research Supervision</h2><hr />
                    <h3>Ph.D. Awarded</h3>
                    <table><thead><tr><th>S.No.</th><th>Name</th><th>Reg. No.</th><th>Thesis Title</th><th>Awarded Date</th></tr></thead>
                    <tbody>
                        <tr><td>1</td><td>Ms. Suchi Bhatt</td><td>-</td><td>Study of Lie Properties of Group Algebras and their Unit Groups</td><td>September 03, 2021</td></tr>
                        <tr><td>2</td><td>Lacchita Soni</td><td>2020088003</td><td>Design of Secure Post-Quantum Cryptographic Schemes with Applications</td><td>August 14, 2025</td></tr>
                        <tr><td>3</td><td>Akanksha Singh</td><td>2020088001</td><td>Design and Analysis of Cryptographic Protocols from Classical to Post-Quantum Cryptography</td><td>August 23, 2025</td></tr>
                    </tbody></table>

                    <h3 style="margin-top: 30px;">Ph.D. Undergoing</h3>
                    <table><thead><tr><th>S.No.</th><th>Name</th><th>Year</th></tr></thead>
                    <tbody>
                        <tr><td>1</td><td>Ms. Deeksha Upadhyay</td><td>2021--</td></tr>
                        <tr><td>2</td><td>Ms. Padmaja Tripathi</td><td>2021--</td></tr>
                        <tr><td>3</td><td>Ms. Sujata Singh</td><td>2022--</td></tr>
                        <tr><td>4</td><td>Mr. Mukul Bhatt</td><td>2025--</td></tr>
                    </tbody></table>

                    <h3 style="margin-top: 30px;">M.Sc. Dissertation Awarded</h3>
                    <table><thead><tr><th>S.No.</th><th>Name</th><th>Roll No.</th><th>Dissertation Title</th></tr></thead>
                    <tbody>
                        <tr><td>1</td><td>Ms. Nikita Srivastava</td><td>-</td><td>Structure of Group Algebras of Units of Certain Finite Group Algebras</td></tr>
                        <tr><td>2</td><td>Mr. Kuldeep Singh</td><td>-</td><td>Classification of Modular Group Algebras with small Lie Nilpotency Indices</td></tr>
                        <tr><td>3</td><td>Mr. Divyanshu Srivastava</td><td>-</td><td>Unit Group Structure of commutative group algebras over finite fields</td></tr>
                        <tr><td>4</td><td>Mr. Ashustosh Mishra</td><td>-</td><td>The strongly Upper Lie Nilpotency Indices of Modular Group Algebras</td></tr>
                        <tr><td>5</td><td>Mr. Vikrant Rai</td><td>2020083007</td><td>Cryptography using Generalized Hessenberg Matrices with Affine-Hill Cipher</td></tr>
                        <tr><td>6</td><td>Ms. Jagriti Tripathi</td><td>2020083003</td><td>A new Approach of Classical Hill Cipher in Public Key Cryptography by using orthogonal Matrix</td></tr>
                        <tr><td>7</td><td>Mr. Abhishek Kumar</td><td>2021083001</td><td>A new encryption scheme based on Legendre's transform</td></tr>
                        <tr><td>8</td><td>Mr. Snagam Tripathi</td><td>2021083006</td><td>Strong key generation through LU decomposition of complete graph matrix for secure encryption</td></tr>
                        <tr><td>9</td><td>Arvind Kumar Patwa</td><td>2022083003</td><td>A new Encryption Scheme based on Sawi-Elzaki Transform</td></tr>
                        <tr><td>10</td><td>Disha</td><td>2022083004</td><td>An Encryption and Decryption Technique using planer graph with self-invertible matrix</td></tr>
                        <tr><td>11</td><td>Jyoti Panchal</td><td>2022083005</td><td>A new public Key Cryptography using Generalized Fibonacci Matrices</td></tr>
                        <tr><td>12</td><td>Md. Arif Alam</td><td>2022083006</td><td>Data Encryption and Decryption using Elzaki transform</td></tr>
                        <tr><td>13</td><td>Pragati Chaturvedi</td><td>2022083009</td><td>A new Encryption Scheme based on Kamal and Mohand Transform using ASCII-value</td></tr>
                        <tr><td>14</td><td>Ms. Kshama Yadav</td><td>2023113003</td><td>On the Structure of the Unit Group of Some Finite Group Algebras and Their Normal Complements</td></tr>
                        <tr><td>15</td><td>Sakshi Pathak</td><td>2023113005</td><td>An Efficient ECC-Based Key Exchange Protocol for Secure Multi-User Communication</td></tr>
                    </tbody></table>
                  `, blocks: [], status: 'published'
                  },
                  {
                    id: 'books', slug: 'books', title: 'Books', content: `
                    <h2>Free Books of Mathematics</h2><hr />
                    <p>Following websites are very useful for books:</p>
                    <ul>
                        <li><a href="http://www.getfreeebooks.com/" target="_blank">http://www.getfreeebooks.com/</a></li>
                        <li><a href="http://www.freebookspot.es/" target="_blank">http://www.freebookspot.es/</a></li>
                        <li><a href="http://www.onlinefreeebooks.net/" target="_blank">http://www.onlinefreeebooks.net/</a></li>
                        <li><a href="http://en.bookfi.org" target="_blank">http://en.bookfi.org</a></li>
                        <li><a href="http://www.bookboon.com" target="_blank">http://www.bookboon.com</a></li>
                    </ul>
                  `, blocks: [], status: 'published'
                  },
                  { id: 'software', slug: 'software', title: 'Software', content: softwareContent, blocks: [], status: 'published' },
                  {
                    id: 'gallery', slug: 'gallery', title: 'Gallery', content: '', blocks: [
                      { id: "g1", type: "image", url: "/1.jpeg" }, { id: "g2", type: "image", url: "/2.jpeg" },
                      { id: "g3", type: "image", url: "/3.jpeg" }, { id: "g4", type: "image", url: "/4.JPG" },
                      { id: "g5", type: "image", url: "/5.JPG" }, { id: "g6", type: "image", url: "/6.jpg" },
                      { id: "g7", type: "image", url: "/7.JPG" }, { id: "g8", type: "image", url: "/8.JPG" },
                      { id: "g9", type: "image", url: "/9.JPG" }, { id: "g10", type: "image", url: "/10.png" },
                      { id: "g11", type: "image", url: "/11.jpeg" }, { id: "g12", type: "image", url: "/12.jpeg" },
                      { id: "g13", type: "image", url: "/13.JPG" }, { id: "g14", type: "image", url: "/14.jpeg" },
                      { id: "g15", type: "image", url: "/15.jpeg" }, { id: "g16", type: "image", url: "/16.jpeg" },
                      { id: "g17", type: "image", url: "/17.jpg" }, { id: "g18", type: "image", url: "/18.jpg" },
                    ], status: 'published'
                  },
                  {
                    id: 'contact', slug: 'contact', title: 'Contact', content: `
                    <h2 class="text-xl sm:text-2xl md:text-3xl font-semibold text-[#913c07] mb-4 sm:mb-6" style="font-family: 'Alegreya', serif;">Contact Details</h2>
                    <div class="rounded-lg sm:rounded-xl p-0 sm:p-4 w-full">
                      <h3 class="text-lg sm:text-xl md:text-2xl font-semibold mb-2" style="font-family: 'Alegreya', serif; color: #913c07;">Dr. Harish Chandra</h3>
                      <p class="text-xs sm:text-sm mb-3 sm:mb-4">Assistant Professor</p>
                      <div class="space-y-1 text-xs sm:text-sm mb-4 sm:mb-6">
                        <p>Department of Mathematics and Scientific Computing</p>
                        <p>Madan Mohan Malaviya University of Technology</p>
                        <p>Gorakhpur, Uttar Pradesh – <span class="font-mono tabular-nums">273010</span>, India</p>
                      </div>
                      
                      <div class="flex items-start gap-4 mb-3 sm:mb-4">
                        <div class="bg-[#913c07]/10 p-2 rounded-lg flex-shrink-0">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#913c07" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        </div>
                        <p class="font-mono tabular-nums text-xs sm:text-sm">+91-9450565757<br/>+91-9235501647</p>
                      </div>

                      <div class="flex items-start gap-4 mb-3 sm:mb-4">
                        <div class="bg-[#913c07]/10 p-2 rounded-lg flex-shrink-0">
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#913c07" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                        </div>
                        <p class="text-sm">
                          Official Email:- <a href="mailto:hcmsc@mmmut.ac.in" class="underline">hcmsc@mmmut.ac.in</a><br/>
                          Personal Email:- <a href="mailto:hc19856@gmail.com" class="underline">hc19856@gmail.com</a>
                        </p>
                      </div>

                      <div class="flex items-start gap-4 mb-3 sm:mb-4">
                        <div class="bg-[#913c07]/10 p-2 rounded-lg flex-shrink-0">
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#913c07" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        </div>
                        <p class="text-sm pt-1 font-mono tabular-nums">26°43′53.2″N 83°25′59.3″E</p>
                      </div>
                    </div>
                  `, blocks: [], status: 'published'
                  },
                  { id: 'administration', slug: 'administration', title: 'Administration', content: '<h2>Administration</h2><hr /><p>Information coming soon.</p>', blocks: [], status: 'published' },
                ];

                try {
                  for (const p of defaults) {
                    const ref = doc(db, 'pages', p.id);
                    await setDoc(ref, {
                      ...p,
                      createdAt: serverTimestamp(),
                      updatedAt: serverTimestamp(),
                      seoTitle: p.title,
                      seoDescription: p.slug,
                      seoKeywords: p.slug
                    });
                  }
                  toast.success("All pages seeded with original theme!");
                  setTimeout(() => window.location.reload(), 1000);
                } catch (e) { console.error(e); toast.error("Error: " + e.message); }
              }}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-all border border-gray-300"
            >
              Seed Default Content
            </button>
            <button
              onClick={() => navigate('/admin/pages/new')}
              data-testid="create-new-page-button"
              className="flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-md font-medium hover:bg-accent/90 transition-all shadow-sm hover:shadow-md"
            >
              <Plus size={20} />
              New Page
            </button>
          </div>
        </div>


        {
          pages.length === 0 ? (
            <div className="text-center py-16 bg-white border border-border rounded-lg">
              <FileText size={48} className="mx-auto text-muted mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-semibold text-primary mb-2">No pages yet?</h3>
              <p className="text-muted mb-6">Your database seems empty (except maybe Home). Click below to fix it.</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => navigate('/admin/pages/new')}
                  className="px-6 py-3 bg-accent text-accent-foreground rounded-md font-medium hover:bg-accent/90 transition-all"
                >
                  Create New Page
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm("Create default pages (Profile, Teaching, etc)?")) return;
                    // We need to import extra functions not at top level or use existing imports
                    // Pages.jsx has: collection, getDocs, deleteDoc, doc
                    // We need: setDoc, serverTimestamp, getDoc
                    // Let's rely on what we can import easily or just do it inline with a hard reload
                    const { setDoc, serverTimestamp, getDoc, doc } = await import('firebase/firestore');

                    const defaults = [
                      { id: 'profile', slug: 'profile', title: 'Profile', content: '<p>Profile...</p>', status: 'published' },
                      { id: 'teaching', slug: 'teaching', title: 'Teaching', content: '<p>Teaching...</p>', status: 'published' },
                      { id: 'research', slug: 'research', title: 'Research', content: '<p>Research...</p>', status: 'published' },
                      { id: 'administration', slug: 'administration', title: 'Administration', content: '<p>Administration...</p>', status: 'published' },
                      { id: 'gallery', slug: 'gallery', title: 'Gallery', content: '<p>Gallery...</p>', status: 'published' },
                      { id: 'contact', slug: 'contact', title: 'Contact', content: '<p>Contact...</p>', status: 'published' }
                    ];

                    try {
                      for (const p of defaults) {
                        const ref = doc(db, 'pages', p.id);
                        // Simple check
                        const snap = await getDoc(ref);
                        if (!snap.exists()) {
                          await setDoc(ref, {
                            ...p,
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp(),
                            seoTitle: p.title, seoDescription: p.slug, seoKeywords: p.slug
                          });
                        }
                      }
                      toast.success("Pages created!");
                      setTimeout(() => window.location.reload(), 1000);
                    } catch (e) {
                      console.error(e);
                      toast.error("Error creating pages: " + e.message);
                    }
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 border border-gray-300 rounded-md font-medium hover:bg-gray-200 transition-all"
                >
                  Seed Default Pages
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {pages.map((page) => (
                <div
                  key={page.id}
                  data-testid={`page-item-${page.id}`}
                  className="bg-white border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-primary mb-1">{page.title || 'Untitled'}</h3>
                      <p className="text-sm text-muted">{page.slug || 'no-slug'}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${page.status === 'published'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-yellow-50 text-yellow-700'
                            }`}
                        >
                          {page.status || 'draft'}
                        </span>
                        <span className="text-xs text-muted">
                          Updated {new Date(page.updatedAt?.toDate?.() || page.updatedAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/admin/pages/edit/${page.id}`)}
                        data-testid={`edit-page-${page.id}`}
                        className="p-2 hover:bg-secondary rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} className="text-muted" />
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        data-testid={`delete-page-${page.id}`}
                        className="p-2 hover:bg-destructive/10 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} className="text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div >
    </AdminLayout >
  );
};
