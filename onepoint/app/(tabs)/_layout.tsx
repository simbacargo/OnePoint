import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { AntDesign, FontAwesome6 } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { useApp } from "../../context/AppProvider";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { is_logged_in } = useApp();
  console.log(is_logged_in);

  if (!is_logged_in) {
    return <Redirect href={"/(auth)/sign-in"} />;
  }
  
  return (
    <Tabs
      initialRouteName='index'
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name='home' size={24} color='grey' />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      
              <Tabs.Screen
                name='Products/index'
                options={{
                  title: 'Products',
                  headerShown: false,
                  tabBarLabel: 'Products',
                  tabBarIcon: ({ color }) => (
                    <FontAwesome name='product-hunt' size={24} color='grey' />
                  )
                }}
              />
     <Tabs.Screen
                name='Sales/index'
                options={{
                  tabBarLabel: 'Sales',
                  headerShown: false,
                  tabBarIcon: ({ color, size }) => (
                    <FontAwesome6
                      name='money-check-dollar'
                      size={24}
                      color='grey'
                    />
                  )
                }}
                
              />
    <Tabs.Screen
                name='Profile'
                options={{
                  title: 'Profile',
                  headerShown: false,
                  tabBarLabel: 'Profile',
                  tabBarIcon: ({ color }) => (
                    <AntDesign name='user' size={24} color='grey' />
                  )
                }}
              />


              <Tabs.Screen
        name="Products/id"
        options={{
          href: null, // <-- Hides the tab button
          headerShown: false,
        }}
      />
      
      {/* 🔴 2. Hide the Register/Other Route */}
      <Tabs.Screen
        name="Products/Register" // Assuming the file is Products/Register.tsx
        options={{
          href: null, // <-- Hides the tab button
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="Sales/[id]"
        options={{
          href: null, // <-- Hides the tab button
          headerShown: false,
        }}
      />
      
      {/* 🔴 2. Hide the Register/Other Route */}
      <Tabs.Screen
        name="Sales/Create" // Assuming the file is Products/Register.tsx
        options={{
          href: null, // <-- Hides the tab button
          headerShown: false,
        }}
      />
      
    </Tabs>
    
  );
}