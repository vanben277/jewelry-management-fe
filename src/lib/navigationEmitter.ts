type NavigationListener = (path: string) => void;

const listeners = new Set<NavigationListener>();

const navigationEmitter = {
  on(listener: NavigationListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  emit(path: string): void {
    listeners.forEach((listener) => listener(path));
  },
};

export default navigationEmitter;
