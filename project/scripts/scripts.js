document.addEventListener('DOMContentLoaded', () => {
	// Set last modified date in the footer
	const lastModifiedSpan = document.getElementById('last-modified');
	lastModifiedSpan.textContent = `Last Modified: ${document.lastModified}`;

	const navMenu = document.querySelector('.nav-menu');
	const links = document.querySelectorAll('.nav-link');
	const navbar = document.querySelector('.navbar');
	const menuToggle = document.querySelector('.menu-toggle');

	// Create hover effect element
	const hoverEffect = document.createElement('div');
	hoverEffect.classList.add('hover-effect');
	navMenu.appendChild(hoverEffect);

	// Navbar hide/reappear on scroll
	let lastScrollTop = 0;
	window.addEventListener('scroll', () => {
		const currentScroll = window.scrollY;
		if (currentScroll > lastScrollTop) {
			navbar.style.top = '-100px'; // Hide navbar
		} else {
			navbar.style.top = '0'; // Show navbar
		}
		lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Prevent negative scroll
	});

	// Hamburger menu functionality
	menuToggle.addEventListener('click', () => {
		navMenu.classList.toggle('active');
		navMenu.classList.toggle('show'); // Ensure the slide-in effect applies
	});

	// Close the pop-up menu when clicking outside
	document.addEventListener('click', e => {
		if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
			navMenu.classList.remove('active', 'show');
		}
	});

	// Prevent menu from closing when clicking inside
	navMenu.addEventListener('click', e => {
		e.stopPropagation();
	});

	// Highlight active link
	const originalActiveLink = [...links].find(link => link.href === window.location.href);
	if (originalActiveLink) {
		originalActiveLink.classList.add('active');
	}

	// Hover effect for navigation links
	links.forEach(link => {
		link.addEventListener('mouseenter', e => {
			const activeLink = document.querySelector('.nav-link.active');
			// Temporarily remove the active class from the active link
			if (activeLink) {
				activeLink.classList.remove('active');
			}

			const rect = e.target.getBoundingClientRect();
			hoverEffect.style.width = `${rect.width}px`;
			hoverEffect.style.height = `${rect.height}px`;
			hoverEffect.style.left = `${rect.left - navMenu.getBoundingClientRect().left}px`;
			hoverEffect.style.top = `${rect.top - navMenu.getBoundingClientRect().top}px`;
			hoverEffect.style.opacity = '1';
		});

		link.addEventListener('mouseleave', () => {
			hoverEffect.style.opacity = '0';

			// Restore the active class to the active link after hover
			const activeLink = document.querySelector('.nav-link.active');
			if (!activeLink) {
				const originalActiveLink = [...links].find(link =>
					link.href === window.location.href
				);
				if (originalActiveLink) {
					originalActiveLink.classList.add('active');
				}
			}
		});
	});

	displayReviews();
	handleReviewSubmission();
	initializeFormConfirmations();
});

// Sample reviews data - in a real application, this would come from a database
const sampleReviews = [
	{
		name: "stecia Nakabugo",
		rating: 5,
		comment: "Exceptional service and stunning riverside views. The staff went above and beyond to make our stay memorable.",
		image: "images/stecia.jpg",
		date: "2024-01-15"
	},
	{
		name: "Namboga Rashidah",
		rating: 4,
		comment: "Beautiful property with excellent amenities. The spa services were outstanding.",
		image: "images/rashida.jpg",
		date: "2024-01-10"
	},
	{
		name: "Nakato Aisha",
		rating: 5,
		comment: "Perfect location for both business and leisure. The conference facilities are state-of-the-art.",
		image: "images/leticia.jpg",
		date: "2024-01-05"
	}
];

let currentReviewIndex = 0;
let reviewInterval;

// Modified displayReviews function
function displayReviews() {
	const reviewsContainer = document.getElementById('reviews-container');
	if (!reviewsContainer) return;

	reviewsContainer.style.display = 'block';
	reviewsContainer.style.position = 'relative';
	reviewsContainer.style.height = '250px'; // Fixed height for container
	reviewsContainer.style.overflow = 'hidden';
	reviewsContainer.innerHTML = ''; // Clear container

	// Create navigation buttons
	const prevButton = document.createElement('button');
	const nextButton = document.createElement('button');
	
	prevButton.innerHTML = '&#10094;';
	nextButton.innerHTML = '&#10095;';
	
	[prevButton, nextButton].forEach(button => {
		button.style.cssText = `
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			background: rgba(41, 128, 185, 0.7);
			border: none;
			color: white;
			padding: 1rem;
			cursor: pointer;
			border-radius: 50%;
			z-index: 2;
			transition: background-color 0.3s ease;
		`;
	});

	prevButton.style.left = '10px';
	nextButton.style.right = '10px';
	
	prevButton.addEventListener('click', showPreviousReview);
	nextButton.addEventListener('click', showNextReview);
	
	reviewsContainer.appendChild(prevButton);
	reviewsContainer.appendChild(nextButton);

	// Display initial review
	showReview(currentReviewIndex);

	// Start automatic slideshow
	startReviewSlideshow();
}

function showReview(index) {
	const reviewsContainer = document.getElementById('reviews-container');
	const currentReview = sampleReviews[index];
	
	const reviewElement = document.createElement('div');
	reviewElement.className = 'review-card';
	reviewElement.style.cssText = `
		position: absolute;
		width: calc(100% - 100px);
		left: 50px;
		opacity: 0;
		transition: opacity 0.5s ease;
		background-color: rgba(255, 255, 255, 0.1);
		border-radius: 10px;
		padding: 1.5rem;
	`;

	const stars = '★'.repeat(currentReview.rating) + '☆'.repeat(5 - currentReview.rating);

	reviewElement.innerHTML = `
		<div class="review-header" style="display: flex; align-items: center; margin-bottom: 1rem;">
			<img src="${currentReview.image}" alt="${currentReview.name}" 
				 style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; margin-right: 1rem;">
			<div>
				<h4 style="margin: 0; color: var(--color-text-light)">${currentReview.name}</h4>
				<div style="color: #F9DC5C">${stars}</div>
			</div>
		</div>
		<p style="color: var(--color-text-light); margin: 0">${currentReview.comment}</p>
		<small style="color: var(--color-text-light); opacity: 0.7">
			${new Date(currentReview.date).toLocaleDateString()}
		</small>
	`;

	// Remove any existing reviews
	const oldReview = reviewsContainer.querySelector('.review-card');
	if (oldReview) {
		oldReview.style.opacity = '0';
		setTimeout(() => oldReview.remove(), 500);
	}

	reviewsContainer.appendChild(reviewElement);
	setTimeout(() => reviewElement.style.opacity = '1', 50);
}

function showNextReview() {
	currentReviewIndex = (currentReviewIndex + 1) % sampleReviews.length;
	showReview(currentReviewIndex);
	resetReviewSlideshow();
}

function showPreviousReview() {
	currentReviewIndex = (currentReviewIndex - 1 + sampleReviews.length) % sampleReviews.length;
	showReview(currentReviewIndex);
	resetReviewSlideshow();
}

function startReviewSlideshow() {
	if (reviewInterval) clearInterval(reviewInterval);
	reviewInterval = setInterval(showNextReview, 5000); // Change review every 5 seconds
}

function resetReviewSlideshow() {
	clearInterval(reviewInterval);
	startReviewSlideshow();
}

// Handle new review submission
function handleReviewSubmission() {
	const reviewForm = document.getElementById('review-form');
	if (!reviewForm) return;

	reviewForm.addEventListener('submit', (e) => {
		e.preventDefault();

		const newReview = {
			name: document.getElementById('reviewer-name').value,
			rating: parseInt(document.getElementById('review-rating').value),
			comment: document.getElementById('review-comment').value,
			date: new Date().toISOString().split('T')[0]
		};

		// Handle image upload
		const imageFile = document.getElementById('reviewer-image').files[0];
		if (imageFile) {
			const reader = new FileReader();
			reader.onload = function(e) {
				newReview.image = e.target.result;
				sampleReviews.unshift(newReview);
				currentReviewIndex = 0;
				showReview(currentReviewIndex);
				resetReviewSlideshow();
				reviewForm.reset();
			};
			reader.readAsDataURL(imageFile);
		}
	});
}

// Form confirmation handlers
function initializeFormConfirmations() {
	// Booking form confirmation
	const bookingForm = document.querySelector('.booking-form');
	if (bookingForm) {
		bookingForm.addEventListener('submit', (e) => {
			e.preventDefault();
			
			// Create confirmation overlay
			const overlay = createConfirmationOverlay(`
				<h2>Booking Confirmed! 🎉</h2>
				<p>Thank you for choosing APV Riverside Grand Hotel.</p>
				<p>Your booking request has been received.</p>
				<p>A confirmation email will be sent shortly.</p>
				<button class="close-confirmation">Close</button>
			`);
			
			// Reset form
			bookingForm.reset();
		});
	}

	// Contact form confirmation
	const contactForm = document.querySelector('.contact-form');
	if (contactForm) {
		contactForm.addEventListener('submit', (e) => {
			e.preventDefault();
			
			// Create confirmation overlay
			const overlay = createConfirmationOverlay(`
				<h2>Message Sent! 📧</h2>
				<p>Thank you for contacting APV Riverside Grand Hotel.</p>
				<p>We will respond to your inquiry within 24 hours.</p>
				<button class="close-confirmation">Close</button>
			`);
			
			// Reset form
			contactForm.reset();
		});
	}
}

function createConfirmationOverlay(content) {
	// Create overlay element
	const overlay = document.createElement('div');
	overlay.className = 'confirmation-overlay';
	overlay.style.cssText = `
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.8);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	`;

	// Create confirmation box
	const confirmationBox = document.createElement('div');
	confirmationBox.className = 'confirmation-box';
	confirmationBox.style.cssText = `
		background-color: #1a1a1a;
		padding: 2rem;
		border-radius: 10px;
		text-align: center;
		max-width: 90%;
		width: 400px;
		box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.1);
		animation: slideIn 0.3s ease-out;
	`;

	// Add content and styles
	confirmationBox.innerHTML = content;
	confirmationBox.querySelector('h2').style.cssText = `
		color: #fff;
		margin-bottom: 1.5rem;
		font-size: 1.8rem;
	`;
	confirmationBox.querySelectorAll('p').forEach(p => {
		p.style.cssText = `
			color: #e0e0e0;
			margin-bottom: 1rem;
			font-size: 1.1rem;
		`;
	});
	confirmationBox.querySelector('.close-confirmation').style.cssText = `
		background-color: var(--color-primary);
		color: white;
		border: none;
		padding: 0.8rem 1.5rem;
		border-radius: 5px;
		cursor: pointer;
		font-size: 1.1rem;
		margin-top: 1rem;
		transition: all 0.3s ease;
	`;

	// Add close functionality
	const closeButton = confirmationBox.querySelector('.close-confirmation');
	closeButton.addEventListener('click', () => {
		overlay.style.opacity = '0';
		setTimeout(() => overlay.remove(), 300);
	});

	// Add hover effect to close button
	closeButton.addEventListener('mouseenter', () => {
		closeButton.style.backgroundColor = 'var(--color-secondary-light)';
		closeButton.style.transform = 'translateY(-2px)';
	});
	closeButton.addEventListener('mouseleave', () => {
		closeButton.style.backgroundColor = 'var(--color-primary)';
		closeButton.style.transform = 'translateY(0)';
	});

	// Add animation styles
	const style = document.createElement('style');
	style.textContent = `
		@keyframes slideIn {
			from {
				transform: translateY(-20px);
				opacity: 0;
			}
			to {
				transform: translateY(0);
				opacity: 1;
			}
		}
	`;
	document.head.appendChild(style);

	overlay.appendChild(confirmationBox);
	document.body.appendChild(overlay);
	
	// Add fade-in effect
	overlay.style.opacity = '0';
	overlay.style.transition = 'opacity 0.3s ease';
	requestAnimationFrame(() => overlay.style.opacity = '1');

	return overlay;
}
// Add to your existing scripts.js file
document.addEventListener('DOMContentLoaded', function() {
    const scrollButton = document.getElementById('scroll-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollButton.style.display = 'flex';
        } else {
            scrollButton.style.display = 'none';
        }
    });

    scrollButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});