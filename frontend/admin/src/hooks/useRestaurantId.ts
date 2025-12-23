import { useAuth } from '../contexts/AuthContext';

export function useRestaurantId(): number | null {
  const { user } = useAuth();
  return user?.restaurantId ?? null;
}
