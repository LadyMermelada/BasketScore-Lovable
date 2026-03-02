// ... (resto de imports igual)
import ClubView from '../components/ClubView'; 

const Index = () => {
  // ... (lógica igual)

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ... (Toaster y AuthModal igual) */}
      <div className="p-4 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'cancha' && (
             // ... (contenido de cancha igual)
          )}

          {activeTab === 'club' && (
            <motion.div key="club" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Eliminada la restricción de bloqueo; ahora carga ClubView directamente */}
              <ClubView />
            </motion.div>
          )}

          {activeTab === 'perfil' && (
            <motion.div key="perfil" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ProfileView sessions={sessions} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* ... (ShotModal y BottomNav igual) */}
    </div>
  );
};

export default Index;
