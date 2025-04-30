import React, { useState ,useEffect} from "react";
import { Helmet } from "react-helmet";




const BusinessPlan: React.FC = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null); // To store the video URL for the modal

  // Function to handle video click and show modal
  const handleVideoClick = (videoUrl: string) => {
    setVideoSrc(videoUrl); // Set the video source when the video thumbnail is clicked
  };

  // Function to close the modal and stop video
  const closeModal = () => {
    setVideoSrc(null); // Reset video source to stop the video when modal is closed
  };
  useEffect(() => {
    // Initialize WOW.js
    new WOW.WOW({
      live: false
    }).init();

    // You can also initialize any other JS libraries here if required
  }, []);

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Value Life Marketing</title>
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        <meta content="" name="keywords" />
        <meta content="" name="description" />
        {/* Favicon */}
        <link href="img/logo.png" rel="icon" />
        {/* Google Web Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Icon Font Stylesheet */}
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css"
          rel="stylesheet"
        />
        {/* Libraries Stylesheet */}
        <link href="lib/animate/animate.min.css" rel="stylesheet" />
        <link href="lib/owlcarousel/assets/owl.carousel.min.css" rel="stylesheet" />
        <link href="lib/lightbox/css/lightbox.min.css" rel="stylesheet" />
        {/* Customized Bootstrap Stylesheet */}
        <link href="css/bootstrap.min.css" rel="stylesheet" />
        {/* Template Stylesheet */}
        <link href="css/style.css" rel="stylesheet" />
      </Helmet>

      {/* Project Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div
            className="text-center mx-auto mb-5 wow fadeInUp"
            data-wow-delay="0.1s"
            style={{ maxWidth: "600px" }}
          >
            <h6 className="section-title bg-white text-center text-primary px-3">
              Business Plan
            </h6>
            <h1 className="display-6 mb-4">
              Value Life Marketing Pvt. Ltd. – Business Plan
            </h1>
          </div>
          <div className="owl-carousel project-carousel wow fadeInUp" data-wow-delay="0.1s">
            {/* Video Items */}
            <div className="project-item border rounded h-100 p-4" data-dot="01">
              <div className="position-relative mb-4">
                <button onClick={() => handleVideoClick("/video/intro.mp4")}>
                  <video className="img-fluid rounded" controls>
                    <source src="/video/intro.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </button>
              </div>
              <h6>Company Overview</h6>
              <span>Value Life is a health and wellness-focused direct selling company offering innovative products.</span>
            </div>

            <div className="project-item border rounded h-100 p-4" data-dot="02">
              <div className="position-relative mb-4">
                <button onClick={() => handleVideoClick("/video/two.mp4")}>
                  <video className="img-fluid rounded" controls>
                    <source src="/video/two.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </button>
              </div>
              <h6>Vision & Mission</h6>
              <span>We transform 100,000 people into millionaires by combining wellness with income opportunities.</span>
            </div>

            <div className="project-item border rounded h-100 p-4" data-dot="03">
              <div className="position-relative mb-4">
                <button onClick={() => handleVideoClick("/video/one.mp4")}>
                  <video className="img-fluid rounded" controls>
                    <source src="/video/one.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </button>
              </div>
              <h6>Products & Services</h6>
              <span>Designed to enhance sleep, blood circulation and improve immunity, hydration, and overall health.</span>
            </div>

            <div className="project-item border rounded h-100 p-4" data-dot="04">
              <div className="position-relative mb-4">
                <button onClick={() => handleVideoClick("/video/four.mp4")}>
                  <video className="img-fluid rounded" controls>
                    <source src="/video/four.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </button>
              </div>
              <h6>Business Model (MLM)</h6>
              <span>Anyone can join for free, No renewals or time limits, Bonuses Offered, Retail Profit (10–20%)</span>
            </div>

            <div className="project-item border rounded h-100 p-4" data-dot="05">
              <div className="position-relative mb-4">
                <button onClick={() => handleVideoClick("/video/five.mp4")}>
                  <video className="img-fluid rounded" controls>
                    <source src="/video/five.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </button>
              </div>
              <h6>Income & Rewards System</h6>
              <span>Daily, weekly, and monthly income through team building and sales.</span>
            </div>
          </div>
        </div>
      </div>
      {/* Project End */}

      {/* Testimonial Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div
            className="text-center mx-auto mb-5 wow fadeInUp"
            data-wow-delay="0.1s"
            style={{ maxWidth: "600px" }}
          >
            <h6 className="section-title bg-white text-center text-primary px-3">
              Testimonial
            </h6>
            <h1 className="display-6 mb-4">What Our Clients Say!</h1>
          </div>
          <div className="owl-carousel testimonial-carousel wow fadeInUp" data-wow-delay="0.1s">
            {/* Testimonial Items */}
            <div className="testimonial-item bg-light rounded p-4">
              <div className="d-flex align-items-center mb-4">
                <img
                  className="flex-shrink-0 rounded-circle border p-1"
                  src="img/testimonial-1.jpg"
                  alt=""
                />
                <div className="ms-4">
                  <h5 className="mb-1">Sangeetha R</h5>
                  <span>Hyderabad</span>
                </div>
              </div>
              <p className="mb-0">
                "Value Life's water purifier has transformed our family's health. We feel more energetic every day!"
              </p>
            </div>

            {/* Other Testimonials */}
            {/* Add similar testimonial items as needed */}
          </div>
        </div>
      </div>
      {/* Testimonial End */}

      {/* Video Modal */}
      {videoSrc && (
        <div className="modal fade show" id="videoModal" tabIndex={-1} style={{ display: "block" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-dark text-white">
              <div className="modal-body p-0">
                <div className="ratio ratio-16x9">
                  <iframe
                    src={videoSrc + "?autoplay=1&rel=0"}
                    title="Project Video"
                    allowFullScreen
                    allow="autoplay"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back to Top */}
      <a
        href="#"
        className="btn btn-lg btn-primary btn-lg-square rounded-circle back-to-top"
      >
        <i className="bi bi-arrow-up"></i>
      </a>
    </>
  );
};

export default BusinessPlan;
