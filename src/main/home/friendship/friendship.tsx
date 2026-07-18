import { PUBLIC_BASE_URL } from '@env';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faCheck,
  faClock,
  faHeart,
  faSearch,
  faTimes,
  faUserMinus,
  faUserPlus,
  faUsers,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { getDownloadURL, listAll, ref } from 'firebase/storage';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { storage } from '../../../../firebaseConfig';
import { api } from '../../../services/api';
import { useTheme } from '../../../theme';
import { localStorage } from '../../../utils/localStorage';
import { showNotification } from '../../../utils/notificationHelper';
import useStyles from './styles';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  profile_image_url?: string | null;
}

interface IncomingRequest {
  id: number;
  requester: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_image_url?: string | null;
  };
  status: string;
  time: Date;
}

// Outgoing endpointinden dönen ham satır tipi
interface RawOutgoingRequest {
  id: number;
  status: 'pending' | 'accepted' | 'declined' | string;
  created_at: string;
  user_a: { id: number; first_name: string; last_name: string };
  user_b: { id: number; first_name: string; last_name: string };
  requested_by: { id: number; first_name: string; last_name: string };
}

// Hızlı kontrol için hedef kullanıcıya göre map
type OutgoingMap = Record<number, { requestId: number; status: string }>;

type FriendshipProps = Record<string, never>;

const Friendship: React.FC<FriendshipProps> = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles(theme);

  const [friends, setFriends] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'id' | 'name'>('name');
  const [searchResults, setSearchResults] = useState<{
    searchedFriends: User[];
    noRelation: User[];
  }>({ searchedFriends: [], noRelation: [] });
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [IncomingRequests, setIncomingRequests] = useState<IncomingRequest[]>(
    [],
  );
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  // YENİ: Arama modalı
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // YENİ: Outgoing map (hedef kullanıcı -> {requestId,status})
  const [outgoingByUserId, setOutgoingByUserId] = useState<OutgoingMap>({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserId = localStorage.getString('user_id');

        if (storedUserId) setUserId(storedUserId);
      } catch (error) {
        console.error('Kullanıcı ID yükleme hatası:', error);
      }
    };
    fetchUserData();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getString('authToken');

      const response = await axios.get(`${PUBLIC_BASE_URL}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        const userData = response.data.user;
        setFirstName(userData.first_name || '');
        setLastName(userData.last_name || '');
        if (userData.profile_image_url)
          setProfileImageUrl(userData.profile_image_url);
      } else {
        showNotification(
          t('friendship.notifications.errorTitle'),
          t('friendship.notifications.userFetchFailed'),
          'danger',
        );
      }
    } catch (error) {
      console.error(error);
      showNotification(
        'Hata',
        'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        'danger',
      );
    }
  };

  const fetchUserProfileImage = useCallback(
    async (userId: number): Promise<string | null> => {
      try {
        const folderRef = ref(storage, 'user-images');
        const listResult = await listAll(folderRef);
        const userFile = listResult.items.find(item =>
          item.name.startsWith(`${userId}`),
        );
        if (!userFile) return null;
        const url = await getDownloadURL(userFile);
        return url;
      } catch (error) {
        console.error('Profil fotoğrafı çekme hatası:', error);
        return null;
      }
    },
    [],
  );

  const fetchFriendsWithImages = useCallback(async () => {
    try {
      const response = await api.get(`/api/friendships/friends`, {
        requiresAuth: true,
        validateStatus: s => s < 500,
      });
      if (response.status === 200) {
        const friendsData: User[] = response.data;
        const friendsWithImages = await Promise.all(
          friendsData.map(async (friend: User) => {
            const imageUrl = await fetchUserProfileImage(friend.id);
            return {
              ...friend,
              profile_image_url: imageUrl ?? friend.profile_image_url ?? null,
            };
          }),
        );
        setFriends(friendsWithImages);
      }
    } catch (error) {
      console.error('API isteği başarısız:', error);
    }
  }, [fetchUserProfileImage]);

  const fetchIncomingRequests = async () => {
    try {
      const response = await api.get('/api/friendships/requests/incoming', {
        requiresAuth: true,
        validateStatus: s => s < 500,
      });
      if (response.status === 200) {
        const requestsData: IncomingRequest[] = response.data;
        const requestsWithImages = await Promise.all(
          requestsData.map(async (request: IncomingRequest) => {
            const imageUrl = await fetchUserProfileImage(request.requester.id);
            return {
              ...request,
              requester: {
                ...request.requester,
                profile_image_url:
                  imageUrl ?? request.requester.profile_image_url ?? null,
              },
            };
          }),
        );
        setIncomingRequests(requestsWithImages);
      }
    } catch (error) {
      console.error('Gelen istekleri çekme hatası:', error);
    }
  };

  // YENİ: Outgoing pending istekleri çek ve hedef kullanıcıya map et
  const fetchOutgoingRequests = useCallback(async () => {
    try {
      if (!userId) return;
      const myId = parseInt(userId, 10);
      const response = await api.get('/api/friendships/requests/outgoing', {
        requiresAuth: true,
        validateStatus: s => s < 500,
      });
      if (response.status === 200) {
        const rows: RawOutgoingRequest[] = response.data || [];
        const map: OutgoingMap = {};
        rows.forEach(r => {
          if (r.requested_by?.id !== myId) return; // ben atmadıysam geç
          // hedef kim? ben user_a isem hedef user_b, değilsem user_a
          const targetId = r.user_a?.id === myId ? r.user_b?.id : r.user_a?.id;
          if (targetId) {
            map[targetId] = { requestId: r.id, status: r.status };
          }
        });
        setOutgoingByUserId(map);
      }
    } catch (error) {
      console.log('outgoing istekler çekilemedi', error);
    }
  }, [userId]);

  // YENİ: İstek iptali
  const cancelFriendRequest = async (requestId: number) => {
    try {
      const response = await api.post(
        '/api/friendships/cancel',
        { id: requestId },
        { requiresAuth: true, validateStatus: s => s < 500 },
      );
      if (response.status === 200) {
        showNotification('Bilgi', 'İstek iptal edildi.', 'info');
        // yeniden yükle
        fetchOutgoingRequests();
      } else {
        showNotification('Hata', 'İstek iptal edilemedi.', 'danger');
      }
    } catch (error) {
      console.error('İstek iptal hatası:', error);
      showNotification('Hata', 'İstek iptal edilemedi.', 'danger');
    }
  };

  const fetchProfileImage = useCallback(async () => {
    try {
      if (userId) {
        const folderRef = ref(storage, 'user-images');
        const listResult = await listAll(folderRef);
        const userFile = listResult.items.find(item =>
          item.name.startsWith(`${userId}`),
        );
        if (!userFile) return;
        const url = await getDownloadURL(userFile);
        setProfileImageUrl(url);
      }
    } catch (error) {
      console.error(error);
      showNotification(
        t('friendship.notifications.profilePhotoMissingTitle'),
        t('friendship.notifications.profilePhotoMissing'),
        'danger',
      );
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
    fetchFriendsWithImages();
    fetchIncomingRequests();
  }, [fetchFriendsWithImages]);

  // userId hazır olduğunda outgoing yükle
  useEffect(() => {
    fetchOutgoingRequests();
  }, [fetchOutgoingRequests]);

  useEffect(() => {
    if (userId) fetchProfileImage();
  }, [userId, fetchProfileImage]);

  const searchUser = async () => {
    if (!searchTerm.trim()) {
      showNotification(
        t('friendship.notifications.warningTitle'),
        t('friendship.notifications.searchMissingTerm'),
        'warning',
      );
      return;
    }

    setIsSearching(true);
    try {
      const token = localStorage.getString('authToken');

      let searchTermInt: number | undefined;

      if (searchType === 'id') {
        searchTermInt = parseInt(searchTerm, 10);
        if (isNaN(searchTermInt)) {
          showNotification(
            t('friendship.notifications.errorTitle'),
            t('friendship.notifications.invalidId'),
            'danger',
          );
          setIsSearching(false);
          return;
        }
      }

      const response =
        searchType !== 'id'
          ? await axios.get(`${PUBLIC_BASE_URL}/api/search`, {
              headers: { Authorization: `Bearer ${token}` },
              params: { search_query: searchTerm, entityType: 'User' },
            })
          : await axios.get(`${PUBLIC_BASE_URL}/api/searchuserwithid`, {
              headers: { Authorization: `Bearer ${token}` },
              params: { user_id: searchTermInt },
            });

      if (response.data?.error) {
        setSearchResults({ searchedFriends: [], noRelation: [] });
        showNotification(
          t('friendship.notifications.infoTitle'),
          t('friendship.notifications.searchNotFound'),
          'info',
        );
      } else {
        const categorized = {
          searchedFriends: [] as User[],
          noRelation: [] as User[],
        };

        const usersWithImages = await Promise.all(
          (response.data as User[]).map(async (user: User) => {
            const imageUrl = await fetchUserProfileImage(user.id);
            return {
              ...user,
              profile_image_url: imageUrl ?? user.profile_image_url ?? null,
            };
          }),
        );

        usersWithImages.forEach(user => {
          if (friends.some(f => f.id === user.id))
            categorized.searchedFriends.push(user);
          else categorized.noRelation.push(user);
        });

        setSearchResults(categorized);
        if (
          categorized.searchedFriends.length === 0 &&
          categorized.noRelation.length === 0
        ) {
          showNotification(
            t('friendship.notifications.infoTitle'),
            t('friendship.notifications.searchNotFound'),
            'info',
          );
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showNotification(
        t('friendship.notifications.errorTitle'),
        t('friendship.notifications.searchError'),
        'danger',
      );
    } finally {
      setIsSearching(false);
    }
  };

  const sendFriendRequest = async (_id: number) => {
    try {
      const response = await api.post(
        '/api/friendships',
        { target_user_id: _id },
        { requiresAuth: true, validateStatus: s => s < 500 },
      );
      if (response.status === 200 || response.status === 201) {
        showNotification(
          t('friendship.notifications.successTitle'),
          t('friendship.notifications.requestSent'),
          'success',
        );
        // YENİ: outgoing listi tazele
        fetchOutgoingRequests();
      } else {
        showNotification(
          t('friendship.notifications.errorTitle'),
          t('friendship.notifications.requestSendFailed'),
          'danger',
        );
      }
    } catch (error) {
      console.error('Arkadaşlık isteği gönderme hatası:', error);
      showNotification(
        t('friendship.notifications.errorTitle'),
        t('friendship.notifications.requestSendFailed'),
        'danger',
      );
    }
  };

  const removeFriend = async (_id: number) => {
    Alert.alert(
      t('friendship.alerts.removeFriendTitle'),
      t('friendship.alerts.removeFriendMessage'),
      [
        { text: t('friendship.alerts.cancel'), style: 'cancel' },
        {
          text: t('friendship.alerts.remove'),
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.delete('/api/friendships', {
                params: { other_user_id: _id },
                requiresAuth: true,
                validateStatus: s => s < 500,
              });
              if (response.status === 200) {
                showNotification(
                  t('friendship.notifications.successTitle'),
                  t('friendship.notifications.friendRemoved'),
                  'success',
                );
                fetchFriendsWithImages();
              } else {
                showNotification(
                  t('friendship.notifications.errorTitle'),
                  t('friendship.notifications.friendRemoveFailed'),
                  'danger',
                );
              }
            } catch (error) {
              console.error('Arkadaş kaldırma hatası:', error);
              showNotification(
                t('friendship.notifications.errorTitle'),
                t('friendship.notifications.friendRemoveFailed'),
                'danger',
              );
            }
          },
        },
      ],
    );
  };

  const handleDeclineRequest = async (_id: number) => {
    try {
      const response = await api.post(
        '/api/friendships/decline',
        { id: _id },
        { requiresAuth: true, validateStatus: s => s < 500 },
      );
      if (response.status === 200) {
        showNotification(
          t('friendship.notifications.infoTitle'),
          t('friendship.notifications.requestDeclined'),
          'info',
        );
        fetchIncomingRequests();
      } else {
        showNotification(
          t('friendship.notifications.errorTitle'),
          t('friendship.notifications.requestDeclineFailed'),
          'danger',
        );
      }
    } catch (error) {
      console.error('İstek reddetme hatası:', error);
      showNotification(
        t('friendship.notifications.errorTitle'),
        t('friendship.notifications.requestDeclineFailed'),
        'danger',
      );
    }
  };

  const handleAcceptRequest = async (_id: number) => {
    try {
      const response = await api.post(
        '/api/friendships/accept',
        { id: _id },
        { requiresAuth: true, validateStatus: s => s < 500 },
      );
      if (response.status === 200) {
        showNotification(
          t('friendship.notifications.successTitle'),
          t('friendship.notifications.requestAccepted'),
          'success',
        );
        fetchIncomingRequests();
        fetchFriendsWithImages();
      } else {
        showNotification(
          t('friendship.notifications.errorTitle'),
          t('friendship.notifications.requestAcceptFailed'),
          'danger',
        );
      }
    } catch (error) {
      console.error('İstek kabul etme hatası:', error);
      showNotification(
        t('friendship.notifications.errorTitle'),
        t('friendship.notifications.requestAcceptFailed'),
        'danger',
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('friendship.headerTitle')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => setShowSearchModal(true)}
            accessibilityRole="button"
            accessibilityLabel={t('friendship.actions.searchUsers')}
          >
            <FontAwesomeIcon
              icon={faSearch as IconProp}
              size={20}
              color={theme.colors.onPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => setShowRequestsModal(true)}
            accessibilityRole="button"
            accessibilityLabel={t('friendship.actions.incomingRequests')}
          >
            <FontAwesomeIcon
              icon={faHeart as IconProp}
              size={20}
              color={theme.colors.onPrimary}
            />
            {IncomingRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{IncomingRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.friendsListSection}>
          <Text style={styles.sectionTitle}>
            {t('friendship.friendsList.title', { count: friends.length })}
          </Text>
          {friends.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesomeIcon
                icon={faUsers as IconProp}
                size={48}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.emptyStateText}>
                {t('friendship.friendsList.emptyTitle')}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {t('friendship.friendsList.emptySubtitle')}
              </Text>
            </View>
          ) : (
            friends.map((friend, index) => (
              <TouchableOpacity
                key={index}
                style={styles.userCard}
                onPress={() =>
                  navigation.navigate('FriendDetail', {
                    friend,
                    isFriend: true,
                  })
                }
              >
                <View style={styles.userAvatar}>
                  {friend.profile_image_url ? (
                    <Image
                      source={{ uri: friend.profile_image_url }}
                      style={styles.userAvatarImage}
                    />
                  ) : (
                    <Text style={styles.userInitials}>
                      {friend.first_name?.charAt(0)}
                      {friend.last_name?.charAt(0)}
                    </Text>
                  )}
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {friend.first_name} {friend.last_name}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={e => {
                    e.stopPropagation();
                    removeFriend(friend.id);
                  }}
                >
                  <FontAwesomeIcon
                    icon={faUserMinus as IconProp}
                    size={16}
                    color={theme.colors.onPrimary}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
      <Modal
        visible={showSearchModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t('friendship.searchModal.title')}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSearchModal(false)}
            >
              <FontAwesomeIcon
                icon={faTimes as IconProp}
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Arama Alanı */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <FontAwesomeIcon
                icon={faSearch as IconProp}
                size={16}
                color={theme.colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder={t('friendship.searchModal.placeholder')}
                placeholderTextColor={theme.colors.textSecondary}
                value={searchTerm}
                onChangeText={setSearchTerm}
                onSubmitEditing={searchUser}
                autoFocus
              />
              <TouchableOpacity
                style={[
                  styles.searchButton,
                  isSearching && styles.searchButtonDisabled,
                ]}
                onPress={searchUser}
                disabled={isSearching}
              >
                <FontAwesomeIcon
                  icon={faSearch as IconProp}
                  size={16}
                  color={theme.colors.onPrimary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Arama Sonuçları */}
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {searchResults.searchedFriends.length > 0 ||
            searchResults.noRelation.length > 0 ? (
              <View style={styles.searchResultsSection}>
                <Text style={styles.sectionTitle}>
                  {t('friendship.searchModal.results')}
                </Text>

                {searchResults.searchedFriends.length > 0 && (
                  <View style={styles.friendsSection}>
                    <Text style={styles.subsectionTitle}>
                      {t('friendship.searchModal.friends')}
                    </Text>
                    {searchResults.searchedFriends.map((user, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.userCard}
                        onPress={() =>
                          navigation.navigate('FriendDetail', {
                            friend: user,
                            isFriend: true,
                          })
                        }
                      >
                        <View style={styles.userAvatar}>
                          {user.profile_image_url ? (
                            <Image
                              source={{ uri: user.profile_image_url }}
                              style={styles.userAvatarImage}
                            />
                          ) : (
                            <Text style={styles.userInitials}>
                              {user.first_name.charAt(0)}
                              {user.last_name.charAt(0)}
                            </Text>
                          )}
                        </View>
                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>
                            {user.first_name} {user.last_name}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={e => {
                            e.stopPropagation();
                            removeFriend(user.id);
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faUserMinus as IconProp}
                            size={16}
                            color={theme.colors.onPrimary}
                          />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {searchResults.noRelation.length > 0 && (
                  <View style={styles.nonFriendsSection}>
                    <Text style={styles.subsectionTitle}>
                      {t('friendship.searchModal.others')}
                    </Text>
                    {searchResults.noRelation.map((user, index) => {
                      const outgoing = outgoingByUserId[user.id]; // YENİ
                      const isPending = outgoing?.status === 'pending';
                      return (
                        <TouchableOpacity
                          key={index}
                          style={styles.userCard}
                          onPress={() =>
                            navigation.navigate('FriendDetail', {
                              friend: user,
                              isFriend: false,
                            })
                          }
                        >
                          <View style={styles.userAvatar}>
                            {user.profile_image_url ? (
                              <Image
                                source={{ uri: user.profile_image_url }}
                                style={styles.userAvatarImage}
                              />
                            ) : (
                              <Text style={styles.userInitials}>
                                {user.first_name.charAt(0)}
                                {user.last_name.charAt(0)}
                              </Text>
                            )}
                          </View>
                          <View style={styles.userInfo}>
                            <Text style={styles.userName}>
                              {user.first_name} {user.last_name}
                            </Text>
                          </View>
                          {isPending ? (
                            <TouchableOpacity
                              style={styles.pendingButton}
                              onPress={e => {
                                e.stopPropagation();
                                cancelFriendRequest(outgoing.requestId);
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faClock as IconProp}
                                size={14}
                              />
                              <FontAwesomeIcon
                                icon={faXmark as IconProp}
                                size={14}
                              />
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              style={styles.addButton}
                              onPress={e => {
                                e.stopPropagation();
                                sendFriendRequest(user.id);
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faUserPlus as IconProp}
                                size={16}
                                color={theme.colors.onPrimary}
                              />
                            </TouchableOpacity>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyRequestsState}>
                <FontAwesomeIcon
                  icon={faSearch as IconProp}
                  size={48}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.emptyRequestsText}>
                  {t('friendship.searchModal.emptyGuide')}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
      <Modal
        visible={showRequestsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRequestsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t('friendship.requestsModal.title')}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowRequestsModal(false)}
            >
              <FontAwesomeIcon
                icon={faTimes as IconProp}
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {IncomingRequests.length === 0 ? (
              <View style={styles.emptyRequestsState}>
                <FontAwesomeIcon
                  icon={faHeart as IconProp}
                  size={48}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.emptyRequestsText}>
                  {t('friendship.requestsModal.empty')}
                </Text>
              </View>
            ) : (
              IncomingRequests.map((request, index) => (
                <View key={index} style={styles.requestCard}>
                  <View style={styles.userAvatar}>
                    {request.requester.profile_image_url ? (
                      <Image
                        source={{ uri: request.requester.profile_image_url }}
                        style={styles.userAvatarImage}
                      />
                    ) : (
                      <Text style={styles.userInitials}>
                        {request.requester.first_name.charAt(0)}
                        {request.requester.last_name.charAt(0)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {request.requester.first_name}{' '}
                      {request.requester.last_name}
                    </Text>
                  </View>
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAcceptRequest(request.id)}
                    >
                      <FontAwesomeIcon
                        icon={faCheck as IconProp}
                        size={16}
                        color={theme.colors.onPrimary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.declineButton}
                      onPress={() => handleDeclineRequest(request.id)}
                    >
                      <FontAwesomeIcon
                        icon={faTimes as IconProp}
                        size={16}
                        color={theme.colors.onPrimary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default Friendship;
