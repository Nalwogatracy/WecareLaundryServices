// main.js

// Initialize AOS
AOS.init({
    duration: 1000,
    once: true
});

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon i');
    
    toastMessage.textContent = message;
    
    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle';
        toast.style.borderLeftColor = '#22c55e';
    } else if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle';
        toast.style.borderLeftColor = '#ef4444';
    } else {
        toastIcon.className = 'fas fa-bell';
        toast.style.borderLeftColor = '#f59e0b';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize EmailJS (Sign up at emailjs.com for free)
(function() {
    emailjs.init("aD2nbPcaEjWCCXkRW"); // Get from emailjs.com
})();

// Generate random order ID
function generateOrderId() {
    return 'WC-' + Math.floor(Math.random() * 1000000);
}

// Load testimonials
const testimonials = [
    {
        name: "Sarah Johnson",
        rating: 5,
        text: "Absolutely amazing service! My clothes came back fresh and perfectly folded. The pickup and delivery was so convenient.",
        initials: "SJ"
    },
    {
        name: "Michael Chen",
        rating: 5,
        text: "Best laundry service in town! They handled my dry cleaning with care and the stains came out perfectly.",
        initials: "MC"
    },
    {
        name: "Emily Rodriguez",
        rating: 4,
        text: "Very professional and punctual. The online booking system is easy to use and the tracking feature is great!",
        initials: "ER"
    }
];

function loadTestimonials() {
    const container = document.getElementById('testimonials');
    if (!container) return;
    
    container.innerHTML = testimonials.map(test => `
        <div class="testimonial-card" data-aos="fade-up">
            <div class="testimonial-rating">
                ${'<i class="fas fa-star"></i>'.repeat(test.rating)}
            </div>
            <div class="testimonial-text">"${test.text}"</div>
            <div class="testimonial-author">
                <div class="author-avatar">${test.initials}</div>
                <div class="author-info">
                    <h4>${test.name}</h4>
                    <p>Verified Customer</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Booking form
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    // Calculate price based on service and weight
    const serviceSelect = document.getElementById('serviceType');
    const weightInput = document.getElementById('weight');
    const priceSpan = document.getElementById('estimatedPrice');
    
    function updatePrice() {
        const service = serviceSelect.value;
        const weight = parseFloat(weightInput.value) || 0;
        let basePrice = 0;
        
        switch(service) {
            case 'Wash & Fold': basePrice = 15; break;
            case 'Dry Cleaning': basePrice = 25; break;
            case 'Ironing Only': basePrice = 10; break;
            case 'Home Textiles': basePrice = 30; break;
            default: basePrice = 0;
        }
        
        const total = basePrice + (weight * 2);
        priceSpan.textContent = `$${total.toFixed(2)}`;
    }
    
    serviceSelect.addEventListener('change', updatePrice);
    weightInput.addEventListener('input', updatePrice);
    
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const bookingData = {
            orderId: generateOrderId(),
            customerName: document.getElementById('customerName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            serviceType: document.getElementById('serviceType').value,
            weight: document.getElementById('weight').value,
            pickupDate: document.getElementById('pickupDate').value,
            pickupTime: document.getElementById('pickupTime').value,
            instructions: document.getElementById('instructions').value,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        // Save to localStorage
        let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        bookings.push(bookingData);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        // Send email notification via EmailJS
        try {
            await emailjs.send('service_p8ui6dr', 'template_l7wdq41', {
                to_email: bookingData.email,
                customer_name: bookingData.customerName,
                order_id: bookingData.orderId,
                service_type: bookingData.serviceType,
                pickup_date: bookingData.pickupDate,
                pickup_time: bookingData.pickupTime,
                reply_to: 'hello@wecarelaundry.com'
            });
        } catch (error) {
            console.log('Email service not configured yet');
        }
        
        // Send real-time notification to admin
        showToast(`Booking confirmed! Your order ID is ${bookingData.orderId}`, 'success');
        
        // Redirect to success page
        setTimeout(() => {
            window.location.href = `success.html?id=${bookingData.orderId}`;
        }, 1500);
    });
}

// Contact form
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const contactData = {
            id: Date.now(),
            name: document.getElementById('contactName').value,
            email: document.getElementById('contactEmail').value,
            phone: document.getElementById('contactPhone').value,
            subject: document.getElementById('contactSubject').value,
            message: document.getElementById('contactMessage').value,
            status: 'unread',
            createdAt: new Date().toISOString()
        };
        
        // Save to localStorage
        let messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.push(contactData);
        localStorage.setItem('messages', JSON.stringify(messages));
        
        // Send email notification
        try {
            await emailjs.send('service_p8ui6dr', 'template_l7wdq41', {
                from_name: contactData.name,
                from_email: contactData.email,
                subject: contactData.subject,
                message: contactData.message,
                to_email: 'hello@wecarelaundry.com'
            });
        } catch (error) {
            console.log('Email service not configured yet');
        }
        
        showToast('Message sent successfully! We\'ll respond within 30 minutes.', 'success');
        contactForm.reset();
    });
}

// Track order
function trackOrder() {
    const orderId = document.getElementById('orderId').value;
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const booking = bookings.find(b => b.orderId === orderId);
    
    const resultDiv = document.getElementById('trackingResult');
    
    if (booking) {
        document.getElementById('trackOrderId').textContent = booking.orderId;
        document.getElementById('trackCustomerName').textContent = booking.customerName;
        document.getElementById('trackService').textContent = booking.serviceType;
        document.getElementById('trackWeight').textContent = booking.weight;
        document.getElementById('trackPickupDate').textContent = booking.pickupDate;
        document.getElementById('trackStatus').innerHTML = `<span class="badge status-${booking.status}">${booking.status.toUpperCase()}</span>`;
        
        // Update status timeline
        const statuses = ['pending', 'confirmed', 'picked_up', 'in_progress', 'delivered'];
        const currentIndex = statuses.indexOf(booking.status);
        
        document.querySelectorAll('.status-step').forEach((step, index) => {
            step.classList.remove('completed', 'active');
            if (index < currentIndex) {
                step.classList.add('completed');
            } else if (index === currentIndex) {
                step.classList.add('active');
            }
        });
        
        resultDiv.style.display = 'block';
        showToast(`Found order ${orderId}`, 'success');
    } else {
        showToast('Order not found. Please check your order ID.', 'error');
        resultDiv.style.display = 'none';
    }
}

// Real-time notification listener (for admin panel)
function setupRealtimeNotifications() {
    // Check for new messages every 30 seconds
    setInterval(() => {
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        const unreadCount = messages.filter(m => m.status === 'unread').length;
        
        if (unreadCount > 0 && document.title !== 'Admin Dashboard') {
            document.title = `(${unreadCount}) We Care Laundry`;
            showToast(`You have ${unreadCount} new message(s)`, 'info');
        }
    }, 30000);
}

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTestimonials();
    setupRealtimeNotifications();
    
    // Set minimum date for pickup
    const pickupDate = document.getElementById('pickupDate');
    if (pickupDate) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        pickupDate.min = tomorrow.toISOString().split('T')[0];
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});