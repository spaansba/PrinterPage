import React from "react"

const PrivacyPolicy = () => {
  const currentDate = new Date().toLocaleDateString()
  const email = "jasenbasopboevenpad@gamil.com" // Replace with your email

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="prose prose-slate">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: {currentDate}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">What We Collect</h2>
          <h3 className="text-xl font-semibold mb-2">Basic Data</h3>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Authentication details through Google/Clerk when you sign in</li>
            <li>Basic usage data (how you interact with our site)</li>
            <li>Device info (browser type, IP address)</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">Optional Calendar Integration</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>If you choose to enable Google Calendar integration:</li>
            <ul className="list-circle pl-5 space-y-2 mt-2">
              <li>Calendar event data</li>
            </ul>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use It</h2>
          <h3 className="text-xl font-semibold mb-2">Basic Usage</h3>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>To let you use the site</li>
            <li>To improve the service</li>
            <li>To keep things secure</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">Calendar Integration</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>To display your calendar availability</li>
            <li>To schedule and manage events</li>
            <li>To sync events with your Google Calendar</li>
          </ul>
          <p className="mt-4 text-sm italic">
            Note: Calendar integration is entirely optional. You can use our core services without
            enabling calendar access.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
          <p className="mb-4">We use:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Google Sign-In for authentication (
              <a
                href="https://policies.google.com/privacy"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Privacy Policy
              </a>
              )
            </li>
            <li>
              Clerk for authentication (
              <a
                href="https://clerk.com/privacy"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Clerk Privacy Policy
              </a>
              )
            </li>
            <li>
              Google Calendar API (optional) (
              <a
                href="https://policies.google.com/privacy"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Privacy Policy
              </a>
              )
            </li>
          </ul>
          <p className="mt-4">
            These services may collect additional data as described in their policies.
          </p>
          <p className="mt-2 text-sm italic">
            You can revoke calendar access at any time through your Google Account settings or our
            app settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Security</h2>
          <p>We use industry-standard security measures to protect your data.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p>You can:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Delete your account</li>
            <li>Get a copy of your data</li>
            <li>Enable or disable calendar integration</li>
            <li>Revoke calendar access</li>
            <li>Contact us about your data at {email}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changes</h2>
          <p>We'll update this page when our practices change.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p>Questions? Email {email}</p>
        </section>
      </div>
    </div>
  )
}

export default PrivacyPolicy
