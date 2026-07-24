import React from 'react';
import { X, Bookmark, MapPin, Trash2, ChevronRight, Globe } from 'lucide-react';
import { GeoCity, FavoriteCity } from '../types';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteCity[];
  onSelectFavorite: (fav: FavoriteCity) => void;
  onRemoveFavorite: (id: string) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onSelectFavorite,
  onRemoveFavorite,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
                <Bookmark className="w-5 h-5 fill-amber-500/20" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Saved Favorites</h3>
                <p className="text-xs text-slate-500">Quick access to bookmarked locations</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Favorites List */}
          {favorites.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-700">No saved locations yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Click the "Save City" button on any location card to bookmark it for fast weather updates.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:shadow-2xs flex items-center justify-between group transition-all"
                >
                  <button
                    onClick={() => {
                      onSelectFavorite(fav);
                      onClose();
                    }}
                    className="flex-1 text-left flex items-center gap-3"
                  >
                    <div className="p-2 rounded-xl bg-white border border-slate-200 text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-300 transition-all shadow-2xs">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {fav.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {[fav.admin1, fav.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRemoveFavorite(fav.id)}
                      title="Remove from favorites"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        onSelectFavorite(fav);
                        onClose();
                      }}
                      className="p-2 rounded-xl text-slate-400 group-hover:text-blue-600 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 text-center font-medium">
          Saved locations stored locally in your browser.
        </div>
      </div>
    </div>
  );
};
