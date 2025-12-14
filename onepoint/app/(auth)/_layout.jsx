import { Redirect, Stack } from 'expo-router'
import { useApp } from '../../context/AppProvider'
import {  useNavigation } from 'expo-router';
import React, { useEffect, useState } from "react";

export default function AuthRoutesLayout() {
  const { isSignedIn } = useApp()
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  if (isSignedIn) {
    return <Redirect href={'/'} />
  }

  return <Stack />
}
