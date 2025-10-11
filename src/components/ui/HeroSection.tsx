import React from 'react';
import { PrimaryButton } from './PrimaryButton';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  tagline?: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
  showFounder?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  tagline = "Track smarter, deliver faster, pay safer",
  primaryButtonText,
  secondaryButtonText,
  onPrimaryClick,
  onSecondaryClick,
  showFounder = true,
}) => {
  return (
    <section className="relative min-h-screen bg-gradient-hero flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
      
      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Tagline */}
          {tagline && (
            <div className="mb-6 animate-fade-in">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white/90 bg-white/10 backdrop-blur-sm border border-white/20">
                <span className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse-soft"></span>
                {tagline}
              </span>
            </div>
          )}

          {/* Main Heading */}
          <h1 className="text-h1 font-heading font-bold text-white mb-6 animate-slide-up">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {subtitle}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <PrimaryButton
              variant="primary"
              size="lg"
              onClick={onPrimaryClick}
              className="bg-white text-primary hover:bg-white/90 shadow-elevated"
            >
              {primaryButtonText}
            </PrimaryButton>
            
            <PrimaryButton
              variant="secondary"
              size="lg"
              onClick={onSecondaryClick}
              className="border-white text-white hover:bg-white/10"
            >
              {secondaryButtonText}
            </PrimaryButton>
          </div>

          {/* Founder Profile */}
          {showFounder && (
            <div className="flex items-center justify-center space-x-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="relative">
                <img
                  src="/Vipul.png"
                  alt="Vipul Sharma"
                  className="w-16 h-16 rounded-full border-4 border-white/20 shadow-elevated"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-white"></div>
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Founded by</p>
                <p className="text-white/80 text-sm">Vipul Sharma</p>
              </div>
            </div>
          )}

          {/* System Status */}
          <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-success/20 backdrop-blur-sm border border-success/30">
              <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></div>
              <span className="text-success font-medium text-sm">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/5 rounded-full animate-pulse-soft"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/5 rounded-full animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-5 w-16 h-16 bg-white/5 rounded-full animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
    </section>
  );
};
