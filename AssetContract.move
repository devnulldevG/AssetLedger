address 0x1 {
    module Assets {
        use std::signer;
        use std::option::Option;
        use std::vector::Vector;

        struct Asset {
            name: vector<u8>,
            id: u64,
            owner: address,
        }

        struct AssetsOwned has key {
            assets: vector<Asset>,
        }

        struct AssetIDTracker has key {
            next_id: u64,
        }

        public fun register_new_asset(owner: &signer, name: vector<u8>) {
            let asset_id = get_next_asset_id();
            let asset = Asset {
                name,
                id: asset_id,
                owner: signer::address_of(owner),
            };
            add_asset_to_owner(owner, asset);
        }

        public fun transfer_asset(from: &signer, to: address, asset_id: u64) {
            let from_address = signer::address_of(from);
            // Assert that the `AssetsOwned` resource exists for the sender
            assert!(exists<AssetsOwned>(from_address), 403, "Sender does not own any assets.");
            let asset_index = find_asset_index(&borrow_global<AssetsOwned>(from_address).assets, asset_id);
            let asset_index_unwrapped = Option::unwrap(asset_index);
            
            let mut from_assets = borrow_global_mut<AssetsOwned>(from_address).assets;
            let asset = Vector::remove(&mut from_assets, asset_index_unwrapped);
            // Ensure the asset being transferred is owned by the sender
            assert!(asset.owner == from_address, 403, "Unauthorized transfer attempt.");

            asset.owner = to; // Update the asset's owner to the new owner

            if (!exists<AssetsOwned>(to)) {
                let new_owned_assets = AssetsOwned { assets: Vector::empty() };
                move_to(to, new_owned_assets);
            }
            add_asset_to_owner_by_address(to, asset);
        }

        public fun get_assets_owned_by(addr: address): vector<Asset> acquires AssetsOwned {
            borrow_global<AssetsOwned>(addr).assets
        }

        fun add_asset_to_owner(owner: &signer, asset: Asset) {
            let owner_addr = signer::address_of(owner);
            if (!exists<AssetsOwned>(owner_addr)) {
                move_to(owner, AssetsOwned { assets: Vector::empty() });
            };
            let owner_assets = borrow_global_mut<AssetsOwned>(owner_addr);
            Vector::push_back(&mut owner_assets.assets, asset);
        }

        fun add_asset_to_owner_by_address(owner_addr: address, asset: Asset) {
            if (!exists<AssetsOwned>(owner_addr)) {
                let new_assets_owned = AssetsOwned { assets: Vector::empty() };
                move_to(owner_addr, new_assets_owned);
            };
            let owner_assets = borrow_global_mut<AssetsOwned>(owner_addr);
            Vector::push_back(&mut owner_assets.assets, asset);
        }

        fun get_next_asset_id(): u64 {
            let has_tracker = exists<AssetIDTracker>(@0x1);
            let id_tracker = if (has_tracker) {
                borrow_global_mut<AssetIDTracker>(@0x1)
            } else {
                let new_tracker = AssetIDTracker { next_id: 1 };
                move_to(@0x1, new_tracker);
                borrow_global_mut<AssetIDTracker>(@0x1)
            };
            let id = id_tracker.next_id;
            id_tracker.next_id = id + 1;
            id
        }

        fun find_asset_index(assets: &vector<Asset>, asset_id: u64): Option<u64> {
            let len = Vector::length(assets);
            let mut index: u64 = 0;

            while (index < len) {
                if (Vector::borrow(assets, index).id == asset_id) {
                    return Option::some(index);
                };
                index = index + 1;
            };
            Option::none()
        }
    }
}