import { useState } from 'react';
import SearchSection from './SearchSection';
import AlertBanner from './AlertBanner';
import InfoBar from './InfoBar';
import Skeleton from './Skeleton';
import RouteCard from './RouteCard';
import NavigationPanel from './NavigationPanel';
import TravelModeSelector from './TravelModeSelector';

export default function Sidebar({
  source,
  destination,
  onSourceChange,
  onDestinationChange,
  onSwap,
  onGetRoutes,
  transportMode,
  onTransportModeChange,
  routeTimes,
  isLoading,
  routes,
  selectedRouteId,
  onRouteSelect,
  onStartNavigation,
  navigating,
  navDistance,
  navEta,
  navRouteName,
  navProgress,
  onStopNavigation,
  travelMode,
  onTravelModeChange,
}) {
  const [collapsed, setCollapsed] = useState(false);
  
  const highAQI = routes.some(r => r.aqi > 60);
  const bestRoute = routes.length > 0 
    ? routes.reduce((best, route) => route.score > best.score ? route : best, routes[0])
    : null;

  // Show travel mode selector once both fields are filled
  const showTravelModes = source.trim().length > 0 && destination.trim().length > 0;

  return (
    <div className={`${collapsed ? 'w-0 min-w-0' : 'w-[400px] min-w-[400px]'} h-screen bg-white flex flex-col overflow-hidden shadow-xl transition-all duration-300 relative z-10 flex-shrink-0`}>
      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-12 bg-white border border-border-light border-l-0 rounded-r-lg cursor-pointer z-20 flex items-center justify-center shadow-md text-[10px] text-text-tertiary hover:bg-bg-gray"
      >
        {collapsed ? '›' : '‹'}
      </button>

      <div className="flex flex-col h-full min-w-[400px] overflow-hidden">
        <SearchSection
          source={source}
          destination={destination}
          onSourceChange={onSourceChange}
          onDestinationChange={onDestinationChange}
          onSwap={onSwap}
          onGetRoutes={onGetRoutes}
          transportMode={transportMode}
          onTransportModeChange={onTransportModeChange}
          routeTimes={routeTimes}
          isLoading={isLoading}
        />

        {/* Travel Mode Selector — visible once source & destination are entered */}
        {showTravelModes && (
          <TravelModeSelector
            selectedMode={travelMode}
            onModeChange={onTravelModeChange}
          />
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <AlertBanner show={routes.length > 0 && highAQI} />
          <InfoBar show={routes.length > 0} routeCount={routes.length} highAQI={highAQI} travelMode={travelMode} />
          <Skeleton show={isLoading} />
          
          {!isLoading && routes.length > 0 && (
            <div className="px-2 py-1.5">
              {routes.map((route, index) => (
                <RouteCard
                  key={`${travelMode}-${route.id}`}
                  route={route}
                  isBest={bestRoute?.id === route.id}
                  isSelected={selectedRouteId === route.id}
                  transportMode={transportMode}
                  onSelect={() => onRouteSelect(route.id)}
                  onNavigate={() => onStartNavigation(route.id)}
                  index={index}
                  travelMode={travelMode}
                />
              ))}
            </div>
          )}
        </div>

        <NavigationPanel
          show={navigating}
          distance={navDistance}
          eta={navEta}
          routeName={navRouteName}
          progress={navProgress}
          onStop={onStopNavigation}
        />
      </div>
    </div>
  );
}
